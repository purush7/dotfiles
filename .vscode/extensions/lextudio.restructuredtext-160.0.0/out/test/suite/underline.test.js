"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const underline = require("../../editor/underline");
const vscode = require("vscode");
suite("Underline Tests", () => {
    test("editor underlines title", done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument({ content: 'hello', language: 'reStructuredText' }).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            let textEditor = editor;
            const newpos = new vscode.Position(0, 5);
            editor.selection = new vscode.Selection(newpos, newpos);
            return editor.edit(edit => {
                underline.underline(editor, edit);
            });
        }).then(() => {
            assert.equal(textDocument.getText(), 'hello\n=====');
        }).then(done, done);
    });
    test("editor toggles title level", done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument({ content: 'hello\n=====', language: 'reStructuredText' }).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            let textEditor = editor;
            const newpos = new vscode.Position(0, 5);
            editor.selection = new vscode.Selection(newpos, newpos);
            return editor.edit(edit => {
                underline.underline(editor, edit);
            });
        }).then(() => {
            assert.equal(textDocument.getText(), 'hello\n-----');
        }).then(done, done);
    });
    test("nextLineChar", () => {
        assert.equal(underline.nextUnderlineChar('='), '-');
        assert.equal(underline.nextUnderlineChar('-'), ':');
        assert.equal(underline.nextUnderlineChar(':'), '.');
        assert.equal(underline.nextUnderlineChar('.'), '\'');
    });
});
//# sourceMappingURL=underline.test.js.map