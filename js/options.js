/* Heavily inspired by Raymond Hill's uBlock Origin */
import dom from "./dom.js";
import i18n from "./i18n.js";
import storage from "./storage.js";

i18n.render();
loadLastPane();
var iframe = dom.qs("#iframe");

window.addEventListener('message', function (event) {
    if (event.source === iframe.contentWindow) {
        i18n.render();
    }
});

dom.qsa(".tabButton").forEach((elem) => {
    elem.addEventListener("click", tabCliked);
});

function tabCliked(event) {
    var pane = dom.attr(event.target, "data-pane");
    storage.set({"optionsLastPane": pane}, () => {
        loadPane(pane);
    });
}

function loadLastPane() {
    storage.get("optionsLastPane", (result) => {
        loadPane(result["optionsLastPane"]);
    });
}

function loadPane(pane) {
    const tabButton = dom.qs(`[data-pane="${pane}"]`);
    if (tabButton.classList.contains("selected")) {
        return;
    }

    iframe.contentWindow.location.replace(pane);

    var saveButton = iframe.contentWindow.document.querySelector("#applyButton");
    if (saveButton && !saveButton.disabled) {
        return;
    }
    
    self.location.replace(`#${pane}`);
    dom.qsa(".tabButton.selected").forEach((elem) => {
        elem.classList.remove("selected");
    });
    tabButton.classList.add("selected");
    tabButton.scrollIntoView();
}
