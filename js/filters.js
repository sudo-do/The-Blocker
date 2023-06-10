/* Heavily inspired by Raymond Hill's uBlock Origin */
import dom from "./dom.js";
import i18n from "./i18n.js";
import storage from "./storage.js";

var codeMirrorOptions = {
    autofocus: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    lineNumbers: true,
    lineWiseCopyCut: true,
    lineWrapping: true,
    mode: "text/plain",
    styleActiveLine: {
        nonEmpty: true,
    },
};

var userEditor = new CodeMirror(dom.getById("userEditor"), codeMirrorOptions);
var avatarEditor = new CodeMirror(dom.getById("avatarEditor"), codeMirrorOptions);
var signatureEditor = new CodeMirror(dom.getById("signatureEditor"), codeMirrorOptions);
var saveButton = dom.qs("#applyButton");

i18n.render();
initializeEditors();

async function initializeEditors() {
    await setEditorText();
    setEditorFocuses();
    editors(setEditorEmptyLines);
    editors(setEditorCursors);
    editors(setEditorChanges);

    userEditor.focus();
}

async function setEditorText() {
    let result = await storage.get(["userArray", "avatarArray", "signatureArray"]);
    userEditor.setValue(result["userArray"].join("\n"));
    avatarEditor.setValue(result["avatarArray"].join("\n"));
    signatureEditor.setValue(result["signatureArray"].join("\n"));
}

function setEditorFocuses() {
    userEditor.setOption("extraKeys", {
        Tab: function(cm) {
            avatarEditor.focus();
        }
    });
    avatarEditor.setOption("extraKeys", {
        Tab: function (cm) {
            signatureEditor.focus();
        }
    });
    signatureEditor.setOption("extraKeys", {
        Tab: function (cm) {
            if (saveButton.disabled) {
                userEditor.focus();
            }
            else {
                saveButton.focus();
            }
        }
    });
}

function editors(func) {
    func(userEditor);
    func(avatarEditor);
    func(signatureEditor);
}

function setEditorEmptyLines(editor) {
    if (editor.getLine(editor.lastLine()).length !== 0) {
        editor.replaceRange("\n", CodeMirror.Pos(editor.lastLine()));
    }
}

function setEditorCursors(editor) {
    editor.setCursor(editor.lineCount(), 0);
}

function setEditorChanges(editor) {
    editor.on("changes", filtersChanged);
}

function filtersChanged(changed) {
    saveButton.disabled = !changed;
}

window.addEventListener("beforeunload", (event) => {
    if (saveButton.disabled) {
        return;
    }

    event.preventDefault();
    event.returnValue = '';
});

saveButton.addEventListener("click", async () => {
    await saveEditorText();
    saveButton.disabled = true;
});

async function saveEditorText() {
    var userText = getEditorText(userEditor);
    var avatarText = getEditorText(avatarEditor);
    var signatureText = getEditorText(signatureEditor);

    var userArray = userText.length === 0 ? [] : userText.split("\n");
    var avatarArray = avatarText.length === 0 ? [] : avatarText.split("\n");
    var signatureArray = signatureText.length === 0 ? [] : signatureText.split("\n");

    var userCount = userArray.length;
    var avatarCount = avatarArray.length;
    var signatureCount = signatureArray.length;

    await storage.set({
        userArray: userArray,
        avatarArray: avatarArray,
        signatureArray: signatureArray,
        userCount: userCount,
        avatarCount: avatarCount,
        signatureCount: signatureCount,
    });

    var CSS = await storage.setCSS();
    console.log(`CSS: ${CSS}`);
}

function getEditorText(editor) {
    return editor.getValue()
        .replace(/[ ]/g, "\n")
        .replace(/[^\n\d]/g, "")
        .replace(/\n{2,}/g, "\n")
        .trim();
}
