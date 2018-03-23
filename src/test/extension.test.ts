import * as vscode from 'vscode';
import * as chai from 'chai';
// import * as duplicateSelection from '../extension';

interface EditorState {
	text: string;
	selections: Array<[number, number, number, number]>;
}

function wait<valueType>(ms: number){
    return function(value: valueType){
        return new Promise(function(resolve: (value: valueType) => void, reject){
            setTimeout(() => {
                resolve(value);
            }, ms);
        });
    };
}

function initializeEditor(initialState: EditorState){
    return vscode.commands.executeCommand("workbench.action.files.newUntitledFile")
        .then(wait(0))
        .then((): vscode.TextEditor => {
            var editor = vscode.window.activeTextEditor;
            chai.expect(editor).not.to.be.equal(undefined, "No editor found.");
            return editor as vscode.TextEditor;
        }).then((editor: vscode.TextEditor) => {
            return editor.edit((edit) => {
                edit.insert(new vscode.Position(0, 0), initialState.text);
            }).then(() => {
                editor.selections = initialState.selections.map(function(selection){
                    return new vscode.Selection(
                        new vscode.Position(selection[0], selection[1]),
                        new vscode.Position(selection[2], selection[3])
                    );
                });
                return editor;
            });
        });
}

function confirmEditorState(editor: vscode.TextEditor, state: EditorState){
    chai.expect(editor.document.getText()).to.be.equal(state.text, "Document contains wrong text.");
    chai.expect(editor.selections.length).to.be.equal(state.selections.length, "Wrong number of selections.");
    state.selections.forEach(function(selection, index){
        var editorSelection = editor.selections[index];
        chai.expect([
            editorSelection.anchor.line,
            editorSelection.anchor.character,
            editorSelection.active.line,
            editorSelection.active.character,
        ]).to.deep.equal(selection, `Wrong selection ${index}`);
        // chai.expect(selection[0]).to.be.equal(editorSelection.anchor.line, `Wrong anchor line in selection ${index}.`);
        // chai.expect(selection[1]).to.be.equal(editorSelection.anchor.character, `Wrong anchor character in selection ${index}.`);
        // chai.expect(selection[2]).to.be.equal(editorSelection.active.line, `Wrong active line in selection ${index}.`);
        // chai.expect(selection[3]).to.be.equal(editorSelection.active.character, `Wrong active character in selection ${index}.`);
    });
    return true;
}

function runFileTest(
	initialState: EditorState,
	commands: Array<string | ((editor: vscode.TextEditor) => undefined)>,
	endState: EditorState
){
    return initializeEditor(initialState)
        .then(wait(0))
        .then((editor) => {
            commands.forEach(function(command){
                if (typeof command === "string"){
                    vscode.commands.executeCommand(command);
                }
                else {
                    command(editor);
                }
            });
            return editor;
        })
        .then(wait(200))
        .then((editor) => {return confirmEditorState(editor, endState);});
}

suite("duplicateselection tests", function(){
    test(
        "Forward copy does nothing with empty selections",
        () => {
            const initialState: EditorState = {
                text: "test content\nwith newline",
                selections: [[0, 1, 0, 1], [1, 4, 1, 4]]
            };
            return runFileTest(initialState, ["duplicateselection.action.copySelectionForwardAction"], initialState);
        }
    );
    test(
        "Backward copy does nothing with empty selections",
        () => {
            const initialState: EditorState = {
                text: "test content\nwith newline",
                selections: [[0, 1, 0, 1], [1, 4, 1, 4]]
            };
            return runFileTest(initialState, ["duplicateselection.action.copySelectionBackwardAction"], initialState);
        }
    );
    
	test(
        "Forward copy without line break", 
        () => {
            const initialState: EditorState = {
                text: "test content\nwith newline",
                selections: [[0, 2, 0, 5]]
            };
            const endState: EditorState = {
                text: "test st content\nwith newline",
                selections: [[0, 5, 0, 8]]
            };
            return runFileTest(initialState, ["duplicateselection.action.copySelectionForwardAction"], endState);
        }
    );
	test(
        "Backward copy without line break", 
        () => {
            const initialState: EditorState = {
                text: "test content\nwith newline",
                selections: [[0, 2, 0, 5]]
            };
            const endState: EditorState = {
                text: "test st content\nwith newline",
                selections: [[0, 2, 0, 5]]
            };
            return runFileTest(initialState, ["duplicateselection.action.copySelectionBackwardAction"], endState);
        }
    );
    
	test(
        "Forward copy with line break", 
        () => {
            const initialState: EditorState = {
                text: "test content\nwith newline",
                selections: [[0, 2, 1, 5]]
            };
            const endState: EditorState = {
                text: "test content\nwith st content\nwith newline",
                selections: [[1, 5, 2, 5]]
            };
            return runFileTest(initialState, ["duplicateselection.action.copySelectionForwardAction"], endState);
        }
    );
	test(
        "Backward copy with line break", 
        () => {
            const initialState: EditorState = {
                text: "test content\nwith newline",
                selections: [[0, 2, 1, 5]]
            };
            const endState: EditorState = {
                text: "test content\nwith st content\nwith newline",
                selections: [[0, 2, 1, 5]]
            };
            return runFileTest(initialState, ["duplicateselection.action.copySelectionBackwardAction"], endState);
        }
    );
    
	test(
        "Forward copy with multiple selections", 
        () => {
            const initialState: EditorState = {
                text: "test content\nwith newline",
                selections: [[1, 1, 0, 7], [0, 2, 0, 5], [1, 3, 1, 8]]
            };
            const endState: EditorState = {
                text: "test st content\nwntent\nwith newh newline",
                selections: [[2, 1, 1, 1], [0, 5, 0, 8], [2, 8, 2, 13]]
            };
            return runFileTest(initialState, ["duplicateselection.action.copySelectionForwardAction"], endState);
        }
    );
	test(
        "Backward copy with multiple selections", 
        () => {
            const initialState: EditorState = {
                text: "test content\nwith newline",
                selections: [[1, 1, 0, 7], [0, 2, 0, 5], [1, 3, 1, 8]]
            };
            const endState: EditorState = {
                text: "test st content\nwntent\nwith newh newline",
                selections: [[1, 1, 0, 10], [0, 2, 0, 5], [2, 3, 2, 8]]
            };
            return runFileTest(initialState, ["duplicateselection.action.copySelectionBackwardAction"], endState);
        }
    );
});