import dom from "./dom.js";
import i18n from "./i18n.js";
import storage from "./storage.js";

i18n.render();

var result;
var userValue = dom.qs("#userValue");
var avatarValue = dom.qs("#avatarValue");
var signatureValue = dom.qs("#signatureValue");

setValues();
setInterval(setValues, 50);

async function setValues() {
    result = await storage.get(["userArray", "avatarArray", "signatureArray"]);
    userValue.textContent = result["userArray"].length;
    avatarValue.textContent = result["avatarArray"].length;
    signatureValue.textContent = result["signatureArray"].length;
    i18n.render();
}
