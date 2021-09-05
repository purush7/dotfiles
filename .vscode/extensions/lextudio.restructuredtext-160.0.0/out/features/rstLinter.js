'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const configuration_1 = require("./utils/configuration");
const lintingProvider_1 = require("./utils/lintingProvider");
class RstLintingProvider {
    constructor(logger, python) {
        this.logger = logger;
        this.python = python;
        this.languageId = 'restructuredtext';
    }
    activate(subscriptions) {
        const provider = new lintingProvider_1.LintingProvider(this, this.logger, this.python);
        provider.activate(subscriptions);
    }
    async loadConfiguration(resource) {
        let module = [];
        let build = configuration_1.Configuration.getLinterPath(resource);
        const name = configuration_1.Configuration.getLinterName(resource);
        if (build == null) {
            const python = await configuration_1.Configuration.getPythonPath(resource);
            if (python) {
                build = process.platform === 'win32'
                    ? '"' + python + '"'
                    : python;
                if (name === 'doc8') {
                    module = module.concat(['-m', 'doc8.main']);
                }
                else if (name === 'rstcheck') {
                    module = module.concat(['-m', 'rstcheck']);
                }
            }
        }
        else {
            if (process.platform === 'win32') {
                build = '"' + build + '"';
            }
        }
        if (build == null) {
            build = name;
        }
        return {
            executable: build,
            module,
            fileArgs: [],
            bufferArgs: [],
            extraArgs: configuration_1.Configuration.getExtraArgs(resource).map((value, index) => configuration_1.Configuration.expandMacro(value, resource)),
            runTrigger: configuration_1.Configuration.getRunType(resource),
            rootPath: configuration_1.Configuration.GetRootPath(resource)
        };
    }
    process(lines) {
        const diagnostics = [];
        for (const line of lines) {
            if (line.includes('No module named') || line.includes('Errno')) {
                diagnostics.push({
                    range: new vscode_1.Range(0, 0, 0, Number.MAX_VALUE),
                    severity: vscode_1.DiagnosticSeverity.Warning,
                    message: line,
                    code: null,
                    source: 'restructuredtext'
                });
                continue;
            }
            const regex = /(.+?):([0-9]+):\s(.+)/;
            const matches = regex.exec(line);
            if (matches === null) {
                continue;
            }
            if (matches[1].endsWith('.py')) {
                // doc8 internal issues.
                continue;
            }
            const lineNumber = parseInt(matches[2], 10) - 1;
            diagnostics.push({
                range: new vscode_1.Range(lineNumber, 0, lineNumber, Number.MAX_VALUE),
                severity: vscode_1.DiagnosticSeverity.Warning,
                message: matches[3],
                code: null,
                source: 'restructuredtext'
            });
        }
        return diagnostics;
    }
}
exports.default = RstLintingProvider;
//# sourceMappingURL=rstLinter.js.map