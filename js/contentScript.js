// import dom from "./dom.js";
// import i18n from "./i18n.js";
// import storage from "./storage.js";

const buttonArray = ["User", "Avatar", "Signature"];
const CSS_HIDE = "theBlocker-hide";
const CSS_SHOW = "theBlocker-show";

var cloneInternal = document.createElement("div");
cloneInternal.className = "actionBar-set actionBar-set--internal";

var cloneReportButton = document.createElement("a");
cloneReportButton.className = "actionBar-action actionBar-action--report";
cloneReportButton.setAttribute("data-xf-click", "overlay");

self.cloneUserButton = document.createElement("a");
self.cloneUserButton.className = "actionBar-action actionBar-action--block userButton";
var cloneUserSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
cloneUserSvg.setAttribute("viewBox", "-64 0 512 512");
cloneUserSvg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", 'path'));
self.cloneUserButton.append(cloneUserSvg, document.createElement("span"));

self.cloneAvatarButton = document.createElement("a");
self.cloneAvatarButton.className = "actionBar-action actionBar-action--block avatarButton";
self.cloneAvatarButton.append(
    self.cloneUserButton.firstElementChild.cloneNode(true),
    self.cloneUserButton.lastElementChild.cloneNode(true)
);

self.cloneSignatureButton = document.createElement("a");
self.cloneSignatureButton.className = "actionBar-action actionBar-action--block signatureButton";
self.cloneSignatureButton.append(
    self.cloneUserButton.firstElementChild.cloneNode(true),
    self.cloneUserButton.lastElementChild.cloneNode(true)
);
self.cloneSignatureButton.firstElementChild.setAttribute("viewBox", "0 0 512 512");

(async () => {
    var settings = await chrome.storage.local.get(null);

    var postIds;
    var userIds;
    var messages;

    initCloneButtons();
    blockButtons();
    observe();
    
    function initCloneButtons() {
        cloneReportButton.textContent = settings[settings["language"]]["contentScriptReportButtonText"];

        self.cloneUserButton.title = settings[settings["language"]]["contentScriptUserButtonTitle"];
        self.cloneAvatarButton.title = settings[settings["language"]]["contentScriptAvatarButtonTitle"];
        self.cloneSignatureButton.title = settings[settings["language"]]["contentScriptSignatureButtonTitle"];
        
        self.cloneUserButton.lastElementChild.textContent = settings[settings["language"]]["contentScriptUserButtonText"];
        self.cloneAvatarButton.lastElementChild.textContent = settings[settings["language"]]["contentScriptAvatarButtonText"];
        self.cloneSignatureButton.lastElementChild.textContent = settings[settings["language"]]["contentScriptSignatureButtonText"];
    }

    function blockButtons() {
        postIds = Array.prototype.map.call(document.querySelectorAll(".message-userContent.lbContainer.js-lbContainer"), node => node.getAttribute("data-lb-id").slice(5));
        userIds = Array.prototype.map.call(document.querySelectorAll(".message-name>:is(a, span)"), node => node.getAttribute("data-user-id"));
        messages = document.querySelectorAll(".message-actionBar.actionBar");

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
                messages[i].lastElementChild.append(...makeBlockButtons(userIds[i]));
            }
        }
    }

    function makeBlockButtons(userId) {
        return buttonArray.map((elem) => {
            if (settings[`settingsButtons${elem}`]) {
                var button = window[`clone${elem}Button`].cloneNode(true);

                if (selfBlockCheck(userId)) {
                    button.classList.add(CSS_HIDE);
                }
                else {
                    if (settings[`${elem.toLowerCase()}Array`].includes(userId)) {
                        button.title = settings[settings["language"]][`contentScript${elem}ButtonUnblockTitle`];
                        button.lastElementChild.textContent = settings[settings["language"]][`contentScript${elem}ButtonUnblockText`];
                    }

                    button.addEventListener("click", blockToggle);
                }

                return button;
            }
        })
        .filter(Boolean);
    }

    async function blockToggle(event) {
        var userId = event.currentTarget.closest("article").querySelector("a[data-user-id]").getAttribute("data-user-id");
        var type = event.currentTarget.classList.item(event.currentTarget.classList.length - 1).replace(/Button$/, "");
        var typeCapital = `${type[0].toUpperCase()}${type.slice(1)}`;
        var buttons = document.querySelectorAll(`.actionBar-action--block.${type}Button`);
        var query;

        settings = await chrome.storage.local.get(null);

        switch (type) {
            case "user":
                query = document.querySelectorAll(`:is(article:has(a[data-user-id="${userId}"]),blockquote[data-attributes="member: ${userId}"],.block-row:has(a[data-user-id="${userId}"]))`);
                break;
            case "avatar":
                query = document.querySelectorAll(`a[data-user-id="${userId}"]>img`);
                break;
            case "signature":
                query = document.querySelectorAll(`.message-signature:has(.js-userSignature-${userId})`);
                break;
            default:
                break;
        }

        if (settings[`${type}Array`].includes(userId)) {
            unblockFunction(type, userId);

            query.forEach((elem) => {
                elem.classList.remove(CSS_HIDE);
                elem.classList.add(CSS_SHOW);
            });

            userIds.forEach((elem, i) => {
                if (elem === userId) {
                    buttons[i].title = settings[settings["language"]][`contentScript${typeCapital}ButtonTitle`];
                    buttons[i].lastElementChild.textContent = settings[settings["language"]][`contentScript${typeCapital}ButtonText`];
                }
            });
        }
        else {
            blockFunction(type, userId);

            query.forEach((elem) => {
                elem.classList.add(CSS_HIDE);
                elem.classList.remove(CSS_SHOW);
            });

            userIds.forEach((elem, i) => {
                if (elem === userId) {
                    buttons[i].title = settings[settings["language"]][`contentScript${typeCapital}ButtonUnblockTitle`];
                    buttons[i].lastElementChild.textContent = settings[settings["language"]][`contentScript${typeCapital}ButtonUnblockText`];
                }
            });
        }
    }

    function blockFunction(buttonType, userId) {
        chrome.runtime.sendMessage({
            type: "block",
            buttonType: buttonType,
            userId: userId
        });
    }

    function unblockFunction(buttonType, userId) {
        chrome.runtime.sendMessage({
            type: "unblock",
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
