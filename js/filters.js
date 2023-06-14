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

var cache = {
    user: "",
    avatar: "",
    signature: "",
};

var userEditor = new CodeMirror(dom.getById("userEditor"), codeMirrorOptions);
var avatarEditor = new CodeMirror(dom.getById("avatarEditor"), codeMirrorOptions);
var signatureEditor = new CodeMirror(dom.getById("signatureEditor"), codeMirrorOptions);
var saveButton = dom.qs("#applyButton");


init();


async function init() {
    await i18n.render();
    parent.postMessage({
        type: "title",
        title: document.title,
    }, "*");


    await setEditorText();
    setEditorFocuses();
    functions([setEditorEmptyLines, setEditorCursors, setEditorChanges]);
    userEditor.focus();
    editors(clearHistory);
}

async function setEditorText() {
    let result = await storage.get(["userArray", "avatarArray", "signatureArray"]);
    
    cache.user = result["userArray"].join("\n");
    cache.avatar = result["avatarArray"].join("\n");
    cache.signature = result["signatureArray"].join("\n");

    userEditor.setValue(cache.user);
    avatarEditor.setValue(cache.avatar);
    signatureEditor.setValue(cache.signature);
}

function setEditorFocuses() {
    userEditor.setOption("extraKeys", {
        Tab: function (cm) {
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

function functions(array) {
    array.forEach(editors);
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
    editor.on("beforeChange", beforeFiltersChanged);
    editor.on("changes", filtersChanged);
}

function clearHistory(editor) {
    editor.clearHistory();
}

function beforeFiltersChanged(instance, changeObj) {
    if (/[^\d]/g.test(changeObj.text.join(""))) {
        changeObj.cancel();
    }
}

function filtersChanged(changed) {
    if (
        cache.user === getEditorText(userEditor) &&
        cache.avatar === getEditorText(avatarEditor) &&
        cache.signature === getEditorText(signatureEditor)
    ) {
        saveButton.disabled = true;
        return;
    }

    saveButton.disabled = !changed;
}

window.addEventListener("beforeunload", (event) => {
    if (saveButton.disabled) {
        return;
    }

    event.preventDefault();
    event.returnValue = '';
});

window.addEventListener("unload", (event) => {
    parent.postMessage({
        type: "tab",
    }, "*");
});

document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();

        if (!saveButton.disabled) {
            saveButton.click();
        }
    }
});

saveButton.addEventListener("click", async () => {
    await saveEditorText();
    editors(clearHistory);
    saveButton.disabled = true;
});

async function saveEditorText() {
    var userText = getEditorText(userEditor);
    var avatarText = getEditorText(avatarEditor);
    var signatureText = getEditorText(signatureEditor);

    cache.user = userText;
    cache.avatar = avatarText;
    cache.signature = signatureText;

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
