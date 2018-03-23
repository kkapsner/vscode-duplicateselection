# duplicateselection

This extension adds an action to vscode to duplicate the current selection.

## Features

Adds the action duplicateselection.action.copySelectionForwardAction and duplicateselection.actioncopySelectionBackwardAction

To get a behaviour similar to SublimeText or Notepad++ you can use the following in your keybindings.json:
```
{
	"key": "ctrl+d",
	"command": "editor.action.copyLinesDownAction",
	"when":  "editorTextFocus && !editorReadonly && !editorHasSelection"
},
{
	"key": "ctrl+d",
	"command": "duplicateselection.action.copySelectionForwardAction",
	"when": "editorTextFocus && !editorReadonly && editorHasSelection"
}
```

## Requirements

None.

## Release Notes

### 1.0.1

Minor cleanups:
* added some documentation
* added licence
* code cleanup
* added some tests
* removed bug with multiple selection in backward copy

### 1.0.0

Initial release of DuplicateSelection. Does nothing else as what is mentioned in the features.
