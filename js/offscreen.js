var current = window.getComputedStyle(document.body).color === "rgb(0, 0, 0)" ? "dark" : "light";

function setIcon() {
    if (window.getComputedStyle(document.body).color === "rgb(0, 0, 0)" && current !== "dark") {
        current = "dark";
        chrome.runtime.sendMessage({
            type: "dark"
        });
    }
    if (window.getComputedStyle(document.body).color === "rgb(255, 255, 255)" && current !== "light") {
        current = "light";
        chrome.runtime.sendMessage({
            type: "light"
        });
    }
}

setInterval(setIcon, 50);
