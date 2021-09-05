"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listExistsOneLineAbove = exports.listIsSelected = exports.tableIsSelected = exports.countTextWidth = exports.isAscii = exports.isSelectingLastChara = exports.getTextAtOffsetPosition = exports.getOpenedWorkfolderUri = void 0;
// ============================================================
// Copyright (c) 2021 Tatsuya Nakamori. All rights reserved.
// See LICENSE in the project root for license information.
// ============================================================
const vscode = require("vscode");
const i18n = require("./i18n");
function getOpenedWorkfolderUri() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!(workspaceFolders === null || workspaceFolders === void 0 ? void 0 : workspaceFolders.length)) {
        console.log(i18n.localize("resttext.sphinx.workspaceFolders.error"));
        return;
    }
    return workspaceFolders[0].uri;
}
exports.getOpenedWorkfolderUri = getOpenedWorkfolderUri;
function getTextAtOffsetPosition(document, position, offset) {
    const curLine = position.line;
    const curChar = position.character;
    const newChar = curChar + offset;
    const lineEndChar = document.lineAt(curLine).range.end.character;
    if (newChar < 0 || newChar > lineEndChar) {
        return;
    }
    const range = new vscode.Range(curLine, curChar, curLine, newChar);
    return document.getText(range);
}
exports.getTextAtOffsetPosition = getTextAtOffsetPosition;
function isSelectingLastChara() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const selPosition = editor.selection.start;
    const lineEndPosition = editor.document.lineAt(selPosition.line).range.end;
    const isLastIndex = selPosition.isEqual(lineEndPosition);
    return isLastIndex;
}
exports.isSelectingLastChara = isSelectingLastChara;
function isAscii(text) {
    if (text.match(/[\x01-\x7E\xA1-\xDF]/)) {
        return true;
    }
    else {
        return false;
    }
}
exports.isAscii = isAscii;
function countTextWidth(text) {
    let count = 0;
    for (let i = 0; i < text.length; i++) {
        const chr = text[i];
        if (isAscii(chr)) {
            count += 1;
        }
        else {
            count += 2;
        }
    }
    return count;
}
exports.countTextWidth = countTextWidth;
function tableIsSelected(editor) {
    if (!editor) {
        editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
    }
    const curLine = editor.selection.start.line;
    const regTableBegin = /^(\+-[-+]+-\+)$/;
    const regTableEnd = /^(?!(\s|\+|\||-))(?<!\w+)/;
    const allText = editor.document.getText();
    const allTextSplit = allText.split(/\r\n|\r|\n/);
    let tableLines = [];
    let inTheTable = false;
    for (let i = 0; i < allTextSplit.length; i++) {
        const textLine = allTextSplit[i];
        if (!inTheTable) {
            var match = regTableBegin.exec(textLine);
            if (match) {
                tableLines.push(i);
                inTheTable = true;
            }
        }
        else {
            var match = regTableEnd.exec(textLine);
            if (match) {
                inTheTable = false;
                if (tableLines.includes(curLine)) {
                    return tableLines;
                }
                else {
                    tableLines = [];
                }
            }
            else {
                tableLines.push(i);
            }
        }
    }
    if (tableLines.includes(curLine)) {
        return tableLines;
    }
    else {
        return;
    }
}
exports.tableIsSelected = tableIsSelected;
function listIsSelected(editor) {
    if (!editor) {
        editor = vscode.window.activeTextEditor;
        if (!editor) {
            return false;
        }
    }
    const curLine = editor.selection.start.line;
    const regListLine = /^\s*((\(?([a-zA-Z0-9]+|#)(\.|\))) )|^\s*([-+*] )/;
    const curLineRange = editor.document.lineAt(curLine).range;
    const curLineText = editor.document.getText(curLineRange);
    var match = regListLine.exec(curLineText);
    if (match) {
        return true;
    }
    else {
        return false;
    }
}
exports.listIsSelected = listIsSelected;
function listExistsOneLineAbove(editor) {
    if (!editor) {
        editor = vscode.window.activeTextEditor;
        if (!editor) {
            return false;
        }
    }
    const curLine = editor.selection.start.line;
    const regListLine = /^\s*((\(?([a-zA-Z0-9]+|#)(\.|\))) )|^\s*([-+*] )/;
    if (curLine == 0) {
        return false;
    }
    else {
        const oneLineAboveRange = editor.document.lineAt(curLine - 1).range;
        const oneLineAboveText = editor.document.getText(oneLineAboveRange);
        var match = regListLine.exec(oneLineAboveText);
        if (match) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.listExistsOneLineAbove = listExistsOneLineAbove;
//# sourceMappingURL=util.js.map