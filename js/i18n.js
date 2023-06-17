import dom from "./dom.js";
import storage from "./storage.js";

const i18n = {}

i18n.settings = {};

i18n.get = function (key) {
    return this.settings[this.settings["language"]][key];
}

i18n.render = async function () {
    this.settings = await storage.get(null);
    this.setData();
}

i18n.setData = function () {
    dom.qsa("[data-i18n]").forEach((elem) => {
        elem.textContent = this.get(dom.attr(elem, "data-i18n"));
    });
}

export default i18n;
