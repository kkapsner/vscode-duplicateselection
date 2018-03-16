'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let forwardCommand = vscode.commands.registerTextEditorCommand(
        'duplicateselection.action.copySelectionForwardAction',
        (editor, edit) => {
            editor.selections.forEach((selection) => {
                const text = editor.document.getText(selection);
                edit.insert(selection.start, text);
            });
        }
    );
    context.subscriptions.push(forwardCommand);
    
    let backwardCommand = vscode.commands.registerTextEditorCommand(
        'duplicateselection.action.copySelectionBackwardAction',
        (editor) => {
            let positions: {anchor: vscode.Position, active: vscode.Position}[] = [];
            editor.edit((edit)=>{
                editor.selections.forEach((selection) => {
                    const text = editor.document.getText(selection);
                    positions.push({
                        anchor: selection.anchor.with(),
                        active: selection.active.with()
                    });
                    edit.insert(selection.start, text);
                });
            }).then(() => {
                editor.selections = editor.selections.map((selection, index) => {
                    return new vscode.Selection(
                        positions[index].anchor,
                        positions[index].active
                    );
                });
            });
        }
    );
    context.subscriptions.push(backwardCommand);
}

// this method is called when your extension is deactivated
export function deactivate(){
    
}