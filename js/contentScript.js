// import dom from "./dom.js";
// import i18n from "./i18n.js";
// import storage from "./storage.js";

const USER_ICON_SVG = "M96 128a128 128 0 01256 0 128 128 0 01-256 0zM135 128a89 89 0 00178 0 89 89 0 00-178 0zM176 304c-97 0-176 79-176 176 0 17 14 32 32 32h384c18 0 32-15 32-32 0-97-79-176-176-176zM40 473c0-73 61-129 136-130h96c75 0 136 57 136 130z";
const AVATAR_ICON_SVG = "M159 200a65 65 0 01130 0 65 65 0 01-130 0zM120 200a104 104 0 00208 0 104 104 0 00-208 0zM52 0c-29 0-52 23-52 52v408c0 29 23 52 52 52h344c29 0 52-23 52-52v-408c0-29-23-52-52-52zM82 473c6-51 50-91 103-91h78c53 0 97 40 104 91zM409 460c0 4-2 7-4 9-8-71-69-126-142-126h-78c-73 0-134 55-142 126-2-2-4-5-4-9v-408c0-7 6-13 13-13h344c7 0 13 6 13 13z";
const SIGNATURE_ICON_SVG = "M8.01 504.06c-6.25-6.93-8.71-14.64-7.84-22.29 8.2-73.36 41.44-142.49 93.59-194.64l193.57-193.64-22.56-22.56c-2.33-2.33-5.42-3.61-8.71-3.61-3.29 0-6.39 1.28-8.72 3.61l-103.99 103.99c-3.63 3.64-8.46 5.64-13.6 5.64-5.14 0-9.96-2-13.6-5.64-3.63-3.64-5.63-8.46-5.63-13.6 0-5.14 2-9.97 5.64-13.6l103.94-103.97c9.57-9.58 22.33-14.86 35.93-14.86 13.58 0 26.33 5.27 35.9 14.84l.03.03 22.55 22.55 46.86-46.79c12.56-12.59 29.29-19.52 47.1-19.52 17.82 0 34.56 6.93 47.14 19.51l37 37c25.89 25.98 25.86 68.25-.06 94.22l-267.68 267.58c-52.01 52.12-121.15 85.36-194.69 93.59-10.17.16-17.07-2.74-22.16-7.83zM314.46 120.75l-193.5 193.6c-42.39 42.35-70.9 98.05-80.61 157.29 59.5-9.9 115.17-38.38 157.2-80.51l193.66-193.62-76.75-76.75z";

const CSS_HIDE = "display:none!important;";

var cloneActionBar = document.createElement("div");
cloneActionBar.className = "message-actionBar actionBar";

var cloneInternal = document.createElement("div");
cloneInternal.className = "actionBar-set actionBar-set--internal";

var cloneReportButton = document.createElement("a");
cloneReportButton.className = "actionBar-action actionBar-action--report";
cloneReportButton.setAttribute("data-xf-click", "overlay");

var cloneUserButton = document.createElement("a");
cloneUserButton.className = "actionBar-action actionBar-action--block user";
var cloneUserSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
cloneUserSvg.setAttribute("viewBox", "-64 0 512 512");
cloneUserSvg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", 'path'));
cloneUserButton.append(cloneUserSvg, document.createElement("span"));

var cloneAvatarButton = document.createElement("a");
cloneAvatarButton.className = "actionBar-action actionBar-action--block avatar";
cloneAvatarButton.append(
    cloneUserButton.firstElementChild.cloneNode(true),
    cloneUserButton.lastElementChild.cloneNode(true)
);

var cloneSignatureButton = document.createElement("a");
cloneSignatureButton.className = "actionBar-action actionBar-action--block signature";
cloneSignatureButton.append(
    cloneUserButton.firstElementChild.cloneNode(true),
    cloneUserButton.lastElementChild.cloneNode(true)
);
cloneSignatureButton.firstElementChild.setAttribute("viewBox", "0 0 512 512");

(async () => {
    var settings = await chrome.storage.local.get(null);

    initCloneButtons();
    blockButtons();
    observe();
    
    function initCloneButtons() {
        cloneReportButton.textContent = settings[settings["language"]]["contentScriptReportButtonText"];

        cloneUserButton.title = settings[settings["language"]]["contentScriptUserButtonTitle"];
        cloneAvatarButton.title = settings[settings["language"]]["contentScriptAvatarButtonTitle"];
        cloneSignatureButton.title = settings[settings["language"]]["contentScriptSignatureButtonTitle"];
        
        cloneUserButton.lastElementChild.textContent = settings[settings["language"]]["contentScriptUserButtonText"];
        cloneAvatarButton.lastElementChild.textContent = settings[settings["language"]]["contentScriptAvatarButtonText"];
        cloneSignatureButton.lastElementChild.textContent = settings[settings["language"]]["contentScriptSignatureButtonText"];
    }

    function blockButtons() {
        var postIds = Array.prototype.map.call(document.querySelectorAll(".message-userContent.lbContainer.js-lbContainer"), node => node.getAttribute("data-lb-id").slice(5));
        var userIds = Array.prototype.map.call(document.querySelectorAll(".message-name>:is(a, span)"), node => node.getAttribute("data-user-id"));
        var messages = document.querySelectorAll(".message-actionBar.actionBar");

        // if article
        if (userIds.length === postIds.length - 1) {
            userIds.splice(0, 0, document.querySelector(".message-articleUserName>a").getAttribute("data-user-id"));
        }

        // report ban and reaction ban
        if (messages.length === 0) {
            for (const footer of document.querySelectorAll(".message-footer")) {
                footer.prepend(cloneActionBar.cloneNode(true));
            }

            messages = document.querySelectorAll(".message-actionBar.actionBar");
        }

        for (let i = 0; i < messages.length; ++i) {
            // no report and no edit
            if (!messages[i].querySelector(".actionBar-set.actionBar-set--internal")) {
                messages[i].append(cloneInternal.cloneNode(true));
            }

            // no report
            if (!messages[i].querySelector(".actionBar-action.actionBar-action--report")) {
                var reportButton = cloneReportButton.cloneNode(true);
                reportButton.setAttribute("href", `/sosyal/mesaj/${postIds[i]}/report`);
                messages[i].lastElementChild.prepend(reportButton);
            }

            if (!messages[i].querySelector(".actionBar-action--block")) {
                messages[i].lastElementChild.append(...makeBlockButtons(userIds, i));
            }
        }
    }

    function makeBlockButtons(userIds, i) {
        var buttons = [];

        if (settings["settingsButtonsUser"]) {
            var userButton = cloneUserButton.cloneNode(true);
            userButton.addEventListener("click", () => {
                if (selfBlockCheck(userIds[i])) {
                    console.log(settings[settings["language"]]["contentScriptSelfBlockText"]);
                    return;
                }

                document.querySelectorAll(`:is(article:has(a[data-user-id="${userIds[i]}"]),blockquote[data-attributes="member: ${userIds[i]}"],.block-row:has(a[data-user-id="${userIds[i]}"]))`)
                .forEach((elem) => {
                    elem.style.cssText = CSS_HIDE;
                });

                blockFunction("user", userIds[i]);
            });

            buttons.push(userButton);
        }

        if (settings["settingsButtonsAvatar"]) {
            var avatarButton = cloneAvatarButton.cloneNode(true);

            avatarButton.addEventListener("click", () => {
                if (selfBlockCheck(userIds[i])) {
                    console.log(settings[settings["language"]]["contentScriptSelfBlockText"]);
                    return;
                }

                document.querySelectorAll(`a[data-user-id="${userIds[i]}"]>img`)
                .forEach((elem) => {
                    elem.style.cssText = CSS_HIDE;
                });

                blockFunction("avatar", userIds[i]);
            });

            buttons.push(avatarButton);
        }

        if (settings["settingsButtonsSignature"]) {
            var signatureButton = cloneSignatureButton.cloneNode(true);

            signatureButton.addEventListener("click", () => {
                if (selfBlockCheck(userIds[i])) {
                    console.log(settings[settings["language"]]["contentScriptSelfBlockText"]);
                    return;
                }

                document.querySelectorAll(`.message-signature:has(.js-userSignature-${userIds[i]})`)
                .forEach((elem) => {
                    elem.style.cssText = CSS_HIDE;
                });

                blockFunction("signature", userIds[i]);
            });

            buttons.push(signatureButton);
        }

        return buttons;
    }

    function blockFunction(buttonType, userId) {
        chrome.runtime.sendMessage({
            type: "block",
            buttonType: buttonType,
            userId: userId
        });
    }

    function selfBlockCheck(userId) {
        // if not member
        if (!document.querySelector(".p-navgroup--member")) {
            return false;
        }

        return userId === document.querySelector(`a[href="/sosyal/hesap/"]>span`).getAttribute("data-user-id");
    }

    async function observe() {
        // const targetNode = document.querySelector(`.p-body-pageContent`);
        const targetNode = document.querySelector(`.block-body.js-replyNewMessageContainer`);
        const config = { attributes: false, childList: true, subtree: true };
        const callback = async (mutationList, observer) => {
            for (const mutation of mutationList) {
                if (mutation.type === 'childList') {
                    blockButtons();
                    break;
                }
            }
        };
        const observer = new MutationObserver(callback);
        if (targetNode) {
            observer.observe(targetNode, config);
        }
        //observer.disconnect();
    }
})();
