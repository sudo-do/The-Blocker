var current = window.getComputedStyle(document.body).color === "rgb(0, 0, 0)" ? "dark" : "light";

setInterval(setIcon, 50);

function setIcon() {
    if (window.getComputedStyle(document.body).color === "rgb(0, 0, 0)" && current !== "dark") {
        current = "dark";
        sendMessage();
    }
    if (window.getComputedStyle(document.body).color === "rgb(255, 255, 255)" && current !== "light") {
        current = "light";
        sendMessage();
    }
}

function sendMessage() {
    chrome.runtime.sendMessage({
        type: "theme",
        theme: current,
    });
}
