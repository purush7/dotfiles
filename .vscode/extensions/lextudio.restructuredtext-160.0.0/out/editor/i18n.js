"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localize = void 0;
// ============================================================
// Copyright (c) 2021 Tatsuya Nakamori. All rights reserved.
// See LICENSE in the project root for license information.
// ============================================================
const vscode = require("vscode");
const i18nFiles = {
    "en": "./../../package.nls.json",
    "ja": "./../../package.nls.ja.json"
};
const i18nData = getData();
function localize(i18nKey) {
    return i18nData[i18nKey];
}
exports.localize = localize;
function getData() {
    // Get locale ("en", "ja", etc..)
    const locale = vscode.env.language;
    // Load [package.nls[.xx].json] file
    var i18nJSON;
    if (locale in i18nFiles) {
        i18nJSON = require(i18nFiles[locale]);
    }
    else {
        i18nJSON = require(i18nFiles["en"]);
    }
    return i18nJSON;
}
//# sourceMappingURL=i18n.js.map