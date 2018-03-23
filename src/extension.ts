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
            let selections: {
                anchor: vscode.Position,
                active: vscode.Position,
                start: vscode.Position,
                end: vscode.Position,
                isReversed: boolean
            }[] = [];
            
            // We cannot use the editorEdit provided from registerTextEditorCommand because it's
            // not possible to controll the selection with that.
            editor.edit((edit)=>{
                editor.selections.forEach((selection) => {
                    const text = editor.document.getText(selection);
                    selections.push({
                        anchor: selection.anchor.with(),
                        active: selection.active.with(),
                        start: selection.start.with(),
                        end: selection.end.with(),
                        isReversed: selection.isReversed
                    });
                    edit.insert(selection.start, text);
                });
            }).then(() => {
                var sortedSelections = selections.slice().sort(function(selection1, selection2){
                    if (selection1.start.line !== selection2.start.line){
                        return selection1.start.line  - selection2.start.line;
                    }
                    else {
                        return selection1.start.character  - selection2.start.character;
                    }
                });
                editor.selections = editor.selections.map((oldSelection, index) => {
                    const selection = selections[index];
                    let lineOffset = 0;
                    let characterOffset = 0;
                    // iterate over all selections that are before the current one
                    for (let i = 0; sortedSelections[i] !== selection && i < sortedSelections.length; i += 1){
                        let preSelection = sortedSelections[i];
                        if (preSelection.start.line === preSelection.end.line){
                            if (preSelection.end.line === selection.start.line){
                                characterOffset += preSelection.end.character - preSelection.start.character;
                            }
                        }
                        else {
                            lineOffset += preSelection.end.line - preSelection.start.line;
                        }
                    }
                    const start = new vscode.Position(
                        selection.start.line + lineOffset,
                        selection.start.character + characterOffset
                    );
                    const end = new vscode.Position(
                        selection.end.line + lineOffset,
                        selection.end.character + (
                            selection.start.line === selection.end.line? characterOffset: 0
                        )
                    );
                    
                    return new vscode.Selection(
                        selection.isReversed? end: start,
                        selection.isReversed? start: end
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