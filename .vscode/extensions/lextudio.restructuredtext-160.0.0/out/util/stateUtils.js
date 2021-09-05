"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetItemsState = exports.getMementoKeys = exports.resetWorkspaceState = exports.getWorkspaceState = exports.setWorkspaceState = exports.updateWorkspaceState = exports.getFromWorkspaceState = exports.resetGlobalState = exports.getGlobalState = exports.setGlobalState = exports.updateGlobalState = exports.getFromGlobalState = void 0;
const vscode = require("vscode");
let globalState;
let workspaceState;
function getFromGlobalState(key, defaultValue) {
    if (!globalState) {
        return defaultValue;
    }
    return globalState.get(key, defaultValue);
}
exports.getFromGlobalState = getFromGlobalState;
function updateGlobalState(key, value) {
    if (!globalState) {
        return;
    }
    return globalState.update(key, value);
}
exports.updateGlobalState = updateGlobalState;
function setGlobalState(state) {
    globalState = state;
}
exports.setGlobalState = setGlobalState;
function getGlobalState() {
    return globalState;
}
exports.getGlobalState = getGlobalState;
function resetGlobalState() {
    resetStateQuickPick(globalState, updateGlobalState);
}
exports.resetGlobalState = resetGlobalState;
function getFromWorkspaceState(key, defaultValue) {
    if (!workspaceState) {
        return defaultValue;
    }
    return workspaceState.get(key, defaultValue);
}
exports.getFromWorkspaceState = getFromWorkspaceState;
function updateWorkspaceState(key, value) {
    if (!workspaceState) {
        return;
    }
    return workspaceState.update(key, value);
}
exports.updateWorkspaceState = updateWorkspaceState;
function setWorkspaceState(state) {
    workspaceState = state;
}
exports.setWorkspaceState = setWorkspaceState;
function getWorkspaceState() {
    return workspaceState;
}
exports.getWorkspaceState = getWorkspaceState;
function resetWorkspaceState() {
    resetStateQuickPick(workspaceState, updateWorkspaceState);
}
exports.resetWorkspaceState = resetWorkspaceState;
function getMementoKeys(state) {
    if (!state) {
        return [];
    }
    // tslint:disable-next-line: no-empty
    if (state._value) {
        const keys = Object.keys(state._value);
        // Filter out keys with undefined values, so they are not shown
        // in the quick pick menu.
        return keys.filter((key) => state.get(key) !== undefined);
    }
    return [];
}
exports.getMementoKeys = getMementoKeys;
async function resetStateQuickPick(state, updateFn) {
    const items = await vscode.window.showQuickPick(getMementoKeys(state), {
        canPickMany: true,
        placeHolder: 'Select the keys to reset.'
    });
    resetItemsState(items, updateFn);
}
function resetItemsState(items, updateFn) {
    if (!items) {
        return;
    }
    items.forEach((item) => updateFn(item, undefined));
}
exports.resetItemsState = resetItemsState;
//# sourceMappingURL=stateUtils.js.map