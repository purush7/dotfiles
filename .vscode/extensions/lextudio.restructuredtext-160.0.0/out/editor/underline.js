"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.underlineWidth = exports.underline = exports.currentUnderlineChar = exports.nextUnderlineChar = void 0;
/**
 * This module provides utility functions to handle underline title levels
 */
const vscode = require("vscode");
const meaw = require("meaw");
// list of underline characters, from higher level to lower level
// Use the recommended items from http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#sections,
// and remove '`' and '_' as the syntax file does not like them.
const underlineChars = ['=', '-', ':', '.', '\'', '"', '~', '^', '*', '+', '#'];
/**
 * Analyze current underline char and return the underline character corresponding
 * to the next subtitle level.
 *
 * @param current - The current underline character
 * @return - The next underline char in the list of precedence
 */
function nextUnderlineChar(current, reverse = false) {
    const nextIndex = underlineChars.indexOf(current) + (reverse ? -1 : 1);
    const nextCharIndex = nextIndex >= 0 ? nextIndex % underlineChars.length : nextIndex + underlineChars.length;
    return underlineChars[nextCharIndex];
}
exports.nextUnderlineChar = nextUnderlineChar;
/**
 * Check if current line is followed by a line of underline characters. If true, return
 * the underline character, otherwise return null.
 *
 * @param currentLine - current line of text under cursor
 * @param nextLine - next line of text
 * @return - the current underline character if any or null
 */
function currentUnderlineChar(currentLine, nextLine) {
    for (const char of underlineChars) {
        if (nextLine.length >= currentLine.length && nextLine === char.repeat(nextLine.length)) {
            return char;
        }
    }
    return null;
}
exports.currentUnderlineChar = currentUnderlineChar;
/**
 * Underline current line. If it's already underlined, pick up the underline character
 * corresponding to the nextitle level and replace the current underline.
 */
function underline(textEditor, edit, reverse = false) {
    textEditor.selections.forEach((selection) => {
        const position = selection.active;
        const line = textEditor.document.lineAt(position.line).text;
        if (line === '') {
            return; // don't underline empty lines
        }
        let underlineChar = null;
        let nextLine = null;
        if (position.line < textEditor.document.lineCount - 1) {
            nextLine = textEditor.document.lineAt(position.line + 1).text;
            underlineChar = currentUnderlineChar(line, nextLine);
        }
        const lineWidth = underlineWidth(line);
        if (underlineChar === null) {
            edit.insert(new vscode.Position(position.line, line.length), '\n' + '='.repeat(lineWidth));
        }
        else {
            const nextLineRange = new vscode.Range(new vscode.Position(position.line + 1, 0), new vscode.Position(position.line + 1, nextLine.length));
            const replacement = nextUnderlineChar(underlineChar, reverse);
            edit.replace(nextLineRange, replacement.repeat(lineWidth));
        }
    });
}
exports.underline = underline;
/**
 * Return the column width of unicode text.
 * See https://sourceforge.net/p/docutils/code/HEAD/tree/tags/docutils-0.14/docutils/utils/__init__.py#l643
 *
 * TODO: consider the count of combining chars same as docutils.
 */
function underlineWidth(line) {
    return meaw.computeWidth(line.normalize());
}
exports.underlineWidth = underlineWidth;
//# sourceMappingURL=underline.js.map