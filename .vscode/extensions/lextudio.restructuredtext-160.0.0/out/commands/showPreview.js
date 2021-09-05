"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowLockedPreviewToSideCommand = exports.ShowPreviewToSideCommand = exports.ShowPreviewCommand = void 0;
const vscode = require("vscode");
async function showPreview(webviewManager, python, uri, previewSettings) {
    let resource = uri;
    if (!(resource instanceof vscode.Uri)) {
        if (vscode.window.activeTextEditor) {
            // we are relaxed and don't check for rst files
            resource = vscode.window.activeTextEditor.document.uri;
        }
    }
    if (!(resource instanceof vscode.Uri)) {
        if (!vscode.window.activeTextEditor) {
            // this is most likely toggling the preview
            return vscode.commands.executeCommand('restructuredtext.showSource');
        }
        // nothing found that could be shown or toggled
        return;
    }
    if (!await python.checkPython(resource) || !await python.checkPreviewEngine(resource)) {
        // no engine to use.
        return;
    }
    const resourceColumn = (vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn) || vscode.ViewColumn.One;
    webviewManager.preview(resource, {
        resourceColumn: resourceColumn,
        previewColumn: previewSettings.sideBySide ? resourceColumn + 1 : resourceColumn,
        locked: !!previewSettings.locked
    });
}
class ShowPreviewCommand {
    constructor(webviewManager, python) {
        this.webviewManager = webviewManager;
        this.python = python;
        this.id = 'restructuredtext.showPreview';
    }
    execute(mainUri, allUris, previewSettings) {
        for (const uri of Array.isArray(allUris) ? allUris : [mainUri]) {
            showPreview(this.webviewManager, this.python, uri, {
                sideBySide: false,
                locked: previewSettings && previewSettings.locked
            });
        }
    }
}
exports.ShowPreviewCommand = ShowPreviewCommand;
class ShowPreviewToSideCommand {
    constructor(webviewManager, python) {
        this.webviewManager = webviewManager;
        this.python = python;
        this.id = 'restructuredtext.showPreviewToSide';
    }
    execute(uri, previewSettings) {
        showPreview(this.webviewManager, this.python, uri, {
            sideBySide: true,
            locked: previewSettings && previewSettings.locked
        });
    }
}
exports.ShowPreviewToSideCommand = ShowPreviewToSideCommand;
class ShowLockedPreviewToSideCommand {
    constructor(webviewManager, python) {
        this.webviewManager = webviewManager;
        this.python = python;
        this.id = 'restructuredtext.showLockedPreviewToSide';
    }
    execute(uri) {
        showPreview(this.webviewManager, this.python, uri, {
            sideBySide: true,
            locked: true
        });
    }
}
exports.ShowLockedPreviewToSideCommand = ShowLockedPreviewToSideCommand;
//# sourceMappingURL=showPreview.js.map