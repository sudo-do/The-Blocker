import dom from "./dom.js";
import storage from "./storage.js";

const i18n = {}

i18n.settings = {};

i18n.get = function (key) {
    return this.settings[this.settings["language"]][key];
}

i18n.render = async function () {
    this.settings = await storage.get(null);
    this.setDataTitle();
    this.setData();
}

i18n.setData = function () {
    dom.qsa("[data-i18n]").forEach(async (elem) => {
        elem.textContent = this.get(dom.attr(elem, "data-i18n"));
    });
}

i18n.setDataTitle = function () {
    dom.qsa("[data-i18n-title]").forEach(async (elem) => {
        dom.attr(elem, "title", this.get(dom.attr(elem, "data-i18n-title")));
    });
}

export default i18n;
