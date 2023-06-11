/* Heavily inspired by Raymond Hill's uBlock Origin */
import dom from "./dom.js";
import i18n from "./i18n.js";
import storage from "./storage.js";

i18n.render();
loadLastPane();
var iframe = dom.qs("#iframe");
var paneToLoad = "";

window.addEventListener('message', function (event) {
    if (["tr", "en"].includes(event.data)) {
        i18n.render();
    }
    if (event.data === true) {
        setSelectedTab();
    }
});

document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();

        var saveButton = iframe.contentWindow.document.querySelector("#applyButton");
        if (saveButton && !saveButton.disabled) {
            saveButton.click();
        }
    }
});

dom.qsa(".tabButton").forEach((elem) => {
    elem.addEventListener("click", tabCliked);
});

function tabCliked(event) {
    var pane = dom.attr(event.target, "data-pane");
    loadPane(pane);
}

function loadLastPane() {
    storage.get("optionsLastPane", (result) => {
        iframe.contentWindow.location.replace(result["optionsLastPane"]);
        const tabButton = dom.qs(`[data-pane="${result["optionsLastPane"]}"]`);
        tabButton.classList.add("selected");
        tabButton.scrollIntoView();
    });
}

function loadPane(pane) {
    paneToLoad = pane;
    const tabButton = dom.qs(`[data-pane="${paneToLoad}"]`);
    if (tabButton.classList.contains("selected")) {
        return;
    }

    iframe.contentWindow.location.replace(paneToLoad);

    if (dom.attr(dom.qs(".tabButton.selected"), "data-pane") === "filters.html") {
        return;
    }

    setSelectedTab();
}

function setSelectedTab() {
    const tabButton = dom.qs(`[data-pane="${paneToLoad}"]`);
    window.location.replace(`#${paneToLoad}`);
    dom.qsa(".tabButton.selected").forEach((elem) => {
        elem.classList.remove("selected");
    });
    tabButton.classList.add("selected");
    tabButton.scrollIntoView();
    storage.set({ "optionsLastPane": paneToLoad });
}
