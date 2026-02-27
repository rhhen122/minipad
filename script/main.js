const textarea = document.getElementById("pad");
const fileInput = document.getElementById("fileInput");
const themeToggle = document.getElementById("themeToggle");

const CONTENT_COOKIE = "minipadContent";
const THEME_COOKIE = "minipadTheme";

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
    };
    reader.readAsText(file);
});

textarea.addEventListener("input", saveToCookie);

function setTheme(theme) {
    document.body.className = theme;
    document.cookie = THEME_COOKIE + "=" + theme + "; path=/; max-age=31536000";
    themeToggle.textContent = theme === "dark" ? "Light" : "Dark";
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
});

// Drag & drop file loading
function handleFileDrop(file) {
    if (!file) return;
    const isText = !file.type || file.type.startsWith('text') || file.name.toLowerCase().endsWith('.txt');
    if (!isText) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        textarea.value = e.target.result;
        saveToCookie();
    };
    reader.readAsText(file);
}

document.addEventListener('dragover', function (e) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
});

document.addEventListener('drop', function (e) {
    e.preventDefault();
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handleFileDrop(f);
});

textarea.addEventListener('dragover', function (e) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    textarea.classList.add('drag-over');
});

textarea.addEventListener('dragleave', function () {
    textarea.classList.remove('drag-over');
});

textarea.addEventListener('drop', function (e) {
    e.preventDefault();
    textarea.classList.remove('drag-over');
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handleFileDrop(f);
});

