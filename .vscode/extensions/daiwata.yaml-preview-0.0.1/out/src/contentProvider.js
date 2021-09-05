'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const imagePath_1 = require("./imagePath");
const yaml2html_1 = require("./yaml2html");
const jsyaml = require('js-yaml');
function packYamlUri(uri) {
    // Temporarily change the URI scheme
    // Pack the original URI in to the 'query' field
    if (uri.scheme === yamlContentProvider.yamlURI.scheme) {
        // Nothing to do
        return uri;
    }
    return uri.with({ scheme: yamlContentProvider.yamlURI.scheme, query: uri.toString() });
}
exports.packYamlUri = packYamlUri;
function unpackYamlUri(uri) {
    // Restore original URI scheme from the 'query' field
    if ((uri.scheme !== yamlContentProvider.yamlURI.scheme) || (!uri.query)) {
        // Not a modified yaml URI, nothing to do
        return uri;
    }
    return vscode.Uri.parse(uri.query);
}
exports.unpackYamlUri = unpackYamlUri;
class yamlContentProvider {
    constructor(context) {
        this.context = context;
        this._onDidChange = new vscode.EventEmitter();
        this._waiting = false;
    }
    provideTextDocumentContent(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            let document = yield vscode.workspace.openTextDocument(unpackYamlUri(uri));
            let text = imagePath_1.imagePath(document.getText(), unpackYamlUri(uri));
            let ymlObj = jsyaml.safeLoad(text);
            let body = yaml2html_1.yaml2html(ymlObj);
            return `<!DOCTYPE html>
			<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
			</head>
			<body class="vscode-body">
				${body}
			</body>
			</html>`;
        });
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    update(uri) {
        if (!this._waiting) {
            this._waiting = true;
            setTimeout(() => {
                this._waiting = false;
                this._onDidChange.fire(uri);
            }, 300);
        }
    }
}
exports.yamlContentProvider = yamlContentProvider;
yamlContentProvider.yamlURI = vscode.Uri.parse('yaml:');
//# sourceMappingURL=contentProvider.js.map