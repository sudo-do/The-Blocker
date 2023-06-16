// import dom from "./dom.js";
// import i18n from "./i18n.js";
// import storage from "./storage.js";

const CSS_HIDE = "display:none!important;";

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
            var cloneActionBar = document.createElement("div");
            cloneActionBar.className = "message-actionBar actionBar";

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

            if (selfBlockCheck(userIds[i])) {
                userButton.style.cssText = CSS_HIDE;
            }
            else {
                userButton.addEventListener("click", (event) => {
                    document.querySelectorAll(`:is(article:has(a[data-user-id="${userIds[i]}"]),blockquote[data-attributes="member: ${userIds[i]}"],.block-row:has(a[data-user-id="${userIds[i]}"]))`)
                        .forEach((elem) => {
                            elem.style.cssText = CSS_HIDE;
                        });

                    blockFunction("user", userIds[i]);
                });
            }

            buttons.push(userButton);
        }

        if (settings["settingsButtonsAvatar"]) {
            var avatarButton = cloneAvatarButton.cloneNode(true);

            if (selfBlockCheck(userIds[i])) {
                avatarButton.style.cssText = CSS_HIDE;
            }
            else {
                avatarButton.addEventListener("click", (event) => {
                    document.querySelectorAll(`a[data-user-id="${userIds[i]}"]>img`)
                        .forEach((elem) => {
                            elem.style.cssText = CSS_HIDE;
                        });

                    blockFunction("avatar", userIds[i]);
                });
            }

            buttons.push(avatarButton);
        }

        if (settings["settingsButtonsSignature"]) {
            var signatureButton = cloneSignatureButton.cloneNode(true);

            if (selfBlockCheck(userIds[i])) {
                signatureButton.style.cssText = CSS_HIDE;
            }
            else {
                signatureButton.addEventListener("click", (event) => {
                    document.querySelectorAll(`.message-signature:has(.js-userSignature-${userIds[i]})`)
                        .forEach((elem) => {
                            elem.style.cssText = CSS_HIDE;
                        });

                    blockFunction("signature", userIds[i]);
                });
            }

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
