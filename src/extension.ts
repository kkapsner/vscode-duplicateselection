'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // register the forward copy command
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
    
    // register the backward copy command
    let backwardCommand = vscode.commands.registerTextEditorCommand(
        'duplicateselection.action.copySelectionBackwardAction',
        (editor) => {
            let positions: {anchor: vscode.Position, active: vscode.Position}[] = [];
            
            // We cannot use the editorEdit provided from registerTextEditorCommand because it's
            // not possible to controll the selection with that.
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

// this extension does not need to do anything on deactivation
// the commands are removed automatically
// export function deactivate(){}