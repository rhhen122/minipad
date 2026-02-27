const textarea = document.getElementById("pad");
const fileInput = document.getElementById("fileInput");
const themeToggle = document.getElementById("themeToggle");
const highlight = document.getElementById("lineHighlight");

const CONTENT_COOKIE = "minipadContent";
const THEME_COOKIE = "minipadTheme";

function updateActiveLine() {
    const style = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(style.lineHeight);
    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    const lineNumber = textBefore.split("\n").length - 1;

    highlight.style.height = lineHeight + "px";
    highlight.style.top = (lineNumber * lineHeight - textarea.scrollTop) + "px";
}

textarea.addEventListener("input", updateActiveLine);
textarea.addEventListener("click", updateActiveLine);
textarea.addEventListener("keyup", updateActiveLine);
textarea.addEventListener("scroll", updateActiveLine);

function saveToCookie() {
    const text = encodeURIComponent(textarea.value);
    document.cookie = CONTENT_COOKIE + "=" + text + "; path=/; max-age=31536000";
}

function loadFromCookie() {
    const cookies = document.cookie.split("; ");
    for (let c of cookies) {
        const [name, value] = c.split("=");
        if (name === CONTENT_COOKIE) {
            textarea.value = decodeURIComponent(value);
            return;
        }
    }
}

function downloadText() {
    const blob = new Blob([textarea.value], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "minipad.txt";
    link.click();
    URL.revokeObjectURL(link.href);
}

fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        textarea.value = e.target.result;
        saveToCookie();
        updateActiveLine();
    };
    reader.readAsText(file);
});

textarea.addEventListener("input", saveToCookie);

function setTheme(theme) {
    document.body.className = theme;
    document.cookie = THEME_COOKIE + "=" + theme + "; path=/; max-age=31536000";
    themeToggle.textContent = theme === "dark" ? "☀ Light" : "🌙 Dark";
}

function loadTheme() {
    const cookies = document.cookie.split("; ");
    for (let c of cookies) {
        const [name, value] = c.split("=");
        if (name === THEME_COOKIE) {
            setTheme(value);
            return;
        }
    }
    setTheme("light");
}

themeToggle.addEventListener("click", function () {
    const isDark = document.body.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
});

window.addEventListener("DOMContentLoaded", function() {
    loadFromCookie();
    loadTheme();
    updateActiveLine();
});
