"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/*---------------------------------------------------------
 * Copyright 2021 The Go Authors. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsInCloudIDE = exports.getConfig = exports.DefaultConfig = exports.Configuration = exports.initConfig = void 0;
const vscode = require("vscode");
const stateUtils_1 = require("./stateUtils");
const WORKSPACE_IS_TRUSTED_KEY = 'WORKSPACE_IS_TRUSTED_KEY';
const SECURITY_SENSITIVE_CONFIG = [
    'sphinxBuildPath',
    'linter.executablePath'
];
async function initConfig(ctx) {
    const isTrusted = stateUtils_1.getFromWorkspaceState(WORKSPACE_IS_TRUSTED_KEY, false);
    if (isTrusted !== defaultConfig.workspaceIsTrusted()) {
        defaultConfig.toggleWorkspaceIsTrusted();
    }
    ctx.subscriptions.push(vscode.commands.registerCommand('restructuredtext.workspace.isTrusted.toggle', toggleWorkspaceIsTrusted));
    if (isTrusted) {
        return;
    }
    const ignored = ignoredWorkspaceConfig(vscode.workspace.getConfiguration('restructuredtext'), SECURITY_SENSITIVE_CONFIG);
    if (ignored.length === 0) {
        return;
    }
    const ignoredSettings = ignored.map((x) => `"restructuredtext.${x}"`).join(',');
    const val = await vscode.window.showWarningMessage(`Some workspace/folder-level settings (${ignoredSettings}) from the untrusted workspace are disabled ` +
        'by default. If this workspace is trusted, explicitly enable the workspace/folder-level settings ' +
        'by running the "reStructuredText: Toggle Workspace Trust Flag" command.', 'OK', 'Trust This Workspace', 'More Info');
    switch (val) {
        case 'Trust This Workspace':
            await toggleWorkspaceIsTrusted();
            break;
        case 'More Info':
            vscode.env.openExternal(vscode.Uri.parse('https://docs.restructuredtext.net/articles/configuration.html#security'));
            break;
        default:
            break;
    }
}
exports.initConfig = initConfig;
function ignoredWorkspaceConfig(cfg, keys) {
    return keys.filter((key) => {
        const inspect = cfg.inspect(key);
        return inspect.workspaceValue !== undefined || inspect.workspaceFolderValue !== undefined;
    });
}
async function toggleWorkspaceIsTrusted() {
    const v = defaultConfig.toggleWorkspaceIsTrusted();
    await stateUtils_1.updateWorkspaceState(WORKSPACE_IS_TRUSTED_KEY, v);
}
// reStructuredText extension configuration for a workspace.
class Configuration {
    constructor(_workspaceIsTrusted = false, getConfiguration = vscode.workspace.getConfiguration) {
        this._workspaceIsTrusted = _workspaceIsTrusted;
        this.getConfiguration = getConfiguration;
    }
    toggleWorkspaceIsTrusted() {
        this._workspaceIsTrusted = !this._workspaceIsTrusted;
        return this._workspaceIsTrusted;
    }
    // returns a Proxied vscode.WorkspaceConfiguration, which prevents
    // from using the workspace configuration if the workspace is untrusted.
    get(section, uri) {
        const cfg = this.getConfiguration(section, uri);
        if (section !== 'restructuredtext' || this._workspaceIsTrusted) {
            return cfg;
        }
        return new WrappedConfiguration(cfg);
    }
    workspaceIsTrusted() {
        return this._workspaceIsTrusted;
    }
}
exports.Configuration = Configuration;
const defaultConfig = new Configuration();
// Returns the workspace Configuration used by the extension.
function DefaultConfig() {
    return defaultConfig;
}
exports.DefaultConfig = DefaultConfig;
// wrappedConfiguration wraps vscode.WorkspaceConfiguration.
// tslint:disable-next-line: max-classes-per-file
class WrappedConfiguration {
    constructor(_wrapped) {
        var _a;
        this._wrapped = _wrapped;
        // set getters for direct setting access (e.g. cfg.gopath), but don't overwrite _wrapped.
        const desc = Object.getOwnPropertyDescriptors(_wrapped);
        for (const prop in desc) {
            // TODO(hyangah): find a better way to exclude WrappedConfiguration's members.
            // These methods are defined by WrappedConfiguration.
            if (typeof prop === 'string' && !['get', 'has', 'inspect', 'update', '_wrapped'].includes(prop)) {
                const d = desc[prop];
                if (SECURITY_SENSITIVE_CONFIG.includes(prop)) {
                    const inspect = this._wrapped.inspect(prop);
                    d.value = (_a = inspect.globalValue) !== null && _a !== void 0 ? _a : inspect.defaultValue;
                }
                Object.defineProperty(this, prop, desc[prop]);
            }
        }
    }
    get(section, defaultValue) {
        var _a, _b;
        if (SECURITY_SENSITIVE_CONFIG.includes(section)) {
            const inspect = this._wrapped.inspect(section);
            return (_b = (_a = inspect.globalValue) !== null && _a !== void 0 ? _a : defaultValue) !== null && _b !== void 0 ? _b : inspect.defaultValue;
        }
        return this._wrapped.get(section, defaultValue);
    }
    has(section) {
        return this._wrapped.has(section);
    }
    inspect(section) {
        return this._wrapped.inspect(section);
    }
    update(section, value, configurationTarget, overrideInLanguage) {
        return this._wrapped.update(section, value, configurationTarget, overrideInLanguage);
    }
}
function getConfig(section, uri) {
    if (!uri) {
        if (vscode.window.activeTextEditor) {
            uri = vscode.window.activeTextEditor.document.uri;
        }
        else {
            uri = null;
        }
    }
    return defaultConfig.get(section, uri);
}
exports.getConfig = getConfig;
// True if the extension is running in known cloud-based IDEs.
exports.IsInCloudIDE = process.env.CLOUD_SHELL === 'true' || process.env.CODESPACES === 'true';
//# sourceMappingURL=config.js.map