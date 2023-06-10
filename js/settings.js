/* Heavily inspired by Raymond Hill's uBlock Origin */
import dom from "./dom.js";
import i18n from "./i18n.js";
import storage from "./storage.js";

var buttons = ["settingsButtonsUser", "settingsButtonsAvatar", "settingsButtonsSignature"];
var inputs = dom.qsa("[data-setting-name]");
var language = dom.qs("#language");

init();
i18n.render();

async function init() {
    var settings = await storage.get(null);

    language.value = settings["language"];
    language.addEventListener("change", languageChanged);

    inputs.forEach(async (elem) => {
        elem.checked = settings[dom.attr(elem, "data-setting-name")];
        elem.addEventListener("change", settingChanged);
    });
}

async function languageChanged(event) {
    var selectedLanguage = language.value;
    await storage.set({"language": selectedLanguage});
    parent.postMessage(selectedLanguage, "*");
    i18n.render();
}

async function settingChanged(event) {
    var data = {};
    var settingName = dom.attr(event.target, "data-setting-name");
    var isChecked = event.target.checked;
    data[settingName] = isChecked;
    await storage.set(data);

    if (buttons.includes(settingName)) {
        return;
    }

    var CSS = await storage.setCSS();
    console.log(`CSS: ${CSS}`);
}
