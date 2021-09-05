'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const cp = require("child_process");
const vscode = require("vscode");
const async_1 = require("./async");
const configuration_1 = require("./configuration");
const lineDecoder_1 = require("./lineDecoder");
var RunTrigger;
(function (RunTrigger) {
    RunTrigger[RunTrigger["onSave"] = 0] = "onSave";
    RunTrigger[RunTrigger["onType"] = 1] = "onType";
    RunTrigger[RunTrigger["off"] = 2] = "off";
})(RunTrigger || (RunTrigger = {}));
(function (RunTrigger) {
    RunTrigger.strings = {
        off: 'off',
        onSave: 'onSave',
        onType: 'onType',
    };
    RunTrigger.from = (value) => {
        if (value === 'onType') {
            return RunTrigger.onType;
        }
        else if (value === 'onSave') {
            return RunTrigger.onSave;
        }
        else {
            return RunTrigger.off;
        }
    };
})(RunTrigger || (RunTrigger = {}));
class LintingProvider {
    constructor(linter, logger, python) {
        this.linter = linter;
        this.logger = logger;
        this.python = python;
        this.executableNotFound = false;
    }
    activate(subscriptions) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
        subscriptions.push(this);
        vscode.workspace.onDidChangeConfiguration(this.resetConfiguration, this, subscriptions);
        vscode.workspace.onDidSaveTextDocument((textDocument) => {
            if (textDocument.fileName.endsWith('settings.json')) {
                this.resetConfiguration();
            }
        }, null, subscriptions);
        this.resetConfiguration();
        vscode.workspace.onDidOpenTextDocument(this.triggerLint, this, subscriptions);
        vscode.workspace.onDidCloseTextDocument((textDocument) => {
            this.diagnosticCollection.delete(textDocument.uri);
            delete this.delayers[textDocument.uri.toString()];
        }, null, subscriptions);
    }
    dispose() {
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
    }
    resetConfiguration() {
        this.linterConfiguration = null;
        vscode.workspace.textDocuments.forEach(this.triggerLint, this);
    }
    async loadConfiguration(resource) {
        const oldExecutable = this.linterConfiguration && this.linterConfiguration.executable;
        this.linterConfiguration = await this.linter.loadConfiguration(resource);
        this.delayers = Object.create(null);
        if (this.executableNotFound) {
            this.executableNotFound = oldExecutable === this.linterConfiguration.executable;
        }
        if (this.documentListener) {
            this.documentListener.dispose();
        }
        if (RunTrigger.from(this.linterConfiguration.runTrigger) === RunTrigger.onType) {
            this.documentListener = vscode.workspace.onDidChangeTextDocument((e) => {
                this.triggerLint(e.document);
            });
        }
        else {
            this.documentListener = vscode.workspace.onDidSaveTextDocument(this.triggerLint, this);
        }
        this.documentListener = vscode.workspace.onDidSaveTextDocument(this.triggerLint, this);
        // Configuration has changed. Reevaluate all documents.
    }
    async triggerLint(textDocument) {
        const currentFolder = configuration_1.Configuration.GetRootPath(textDocument.uri);
        if (this.linterConfiguration === null || (currentFolder && this.linterConfiguration.rootPath !== currentFolder)) {
            await this.loadConfiguration(textDocument.uri);
        }
        if (textDocument.languageId !== this.linter.languageId ||
            textDocument.uri.scheme !== 'file' ||
            this.executableNotFound ||
            RunTrigger.from(this.linterConfiguration.runTrigger) === RunTrigger.off) {
            return;
        }
        const key = textDocument.uri.toString();
        let delayer = this.delayers[key];
        if (!delayer) {
            delayer = new async_1.ThrottledDelayer(RunTrigger.from(this.linterConfiguration.runTrigger)
                === RunTrigger.onType ? 250 : 0);
            this.delayers[key] = delayer;
        }
        delayer.trigger(() => this.doLint(textDocument));
    }
    async doLint(textDocument) {
        if (configuration_1.Configuration.getLinterDisabled()) {
            return;
        }
        if (!(await this.python.checkPython(textDocument.uri, false)) || !(await this.python.checkLinter(textDocument.uri, false, false))) {
            return;
        }
        return new Promise((resolve, reject) => {
            const executable = this.linterConfiguration.executable;
            const decoder = new lineDecoder_1.LineDecoder();
            let diagnostics = [];
            const file = process.platform === 'win32'
                ? '"' + textDocument.fileName + '"'
                : textDocument.fileName;
            const rootPath = configuration_1.Configuration.GetRootPath(textDocument.uri);
            const options = rootPath ? { rootPath, shell: true } : undefined;
            let args = [];
            args = args.concat(this.linterConfiguration.module);
            if (RunTrigger.from(this.linterConfiguration.runTrigger) === RunTrigger.onSave) {
                args = args.concat(this.linterConfiguration.fileArgs.slice(0));
                args.push(file);
            }
            else {
                args.push(file);
            }
            args = args.concat(this.linterConfiguration.extraArgs);
            const childProcess = cp.spawn(executable, args, options);
            this.logger.log(`[linter] Execute: ${executable} ${args.join(' ')} in ${rootPath}.`);
            childProcess.on('error', (error) => {
                if (this.executableNotFound) {
                    resolve();
                    return;
                }
                let message = null;
                if (error.code === 'ENOENT') {
                    message = `Cannot lint ${textDocument.fileName}. The executable '${executable}' was not found. Use the '${this.linter.languageId}.linter.executablePath' setting to configure the location of the executable`;
                }
                else {
                    message = error.message ? error.message : `Failed to run executable using path: ${executable}. Reason is unknown.`;
                }
                this.logger.log(`[linter] ${message}`);
                vscode.window.showInformationMessage(message);
                this.executableNotFound = true;
                resolve();
            });
            const onDataEvent = (data) => { decoder.write(data); };
            const onEndEvent = () => {
                decoder.end();
                const lines = decoder.getLines();
                if (lines && lines.length > 0) {
                    diagnostics = this.linter.process(lines);
                }
                this.diagnosticCollection.set(textDocument.uri, diagnostics);
                resolve();
            };
            if (childProcess.pid) {
                if (RunTrigger.from(this.linterConfiguration.runTrigger) === RunTrigger.onType) {
                    childProcess.stdin.write(textDocument.getText());
                    childProcess.stdin.end();
                }
                childProcess.stderr.on('data', onDataEvent);
                childProcess.stderr.on('end', onEndEvent);
                childProcess.stdout.on('data', onDataEvent);
                childProcess.stdout.on('end', onEndEvent);
            }
            else {
                resolve();
            }
        });
    }
}
exports.LintingProvider = LintingProvider;
//# sourceMappingURL=lintingProvider.js.map