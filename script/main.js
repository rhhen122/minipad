const textarea = document.getElementById("pad");
const fileInput = document.getElementById("fileInput");
const themeToggle = document.getElementById("themeToggle");
const alignToggle = document.getElementById("alignToggle");
const logoBtn = document.getElementById("logoBtn");
const popup = document.getElementById("popup");
const closePopup = document.getElementById("closePopup");
const sizeIncrease = document.getElementById("sizeIncrease");
const sizeDecrease = document.getElementById("sizeDecrease");
const sizeReset = document.getElementById("sizeReset");

const CONTENT_COOKIE = "minipadContent";
const THEME_COOKIE = "minipadTheme";
const ALIGN_COOKIE = "minipadAlign";
const FONTSIZE_COOKIE = "minipadFontSize";

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

// Logo button popup functionality
logoBtn.addEventListener("click", function() {
    popup.classList.add("active");
});

closePopup.addEventListener("click", function() {
    popup.classList.remove("active");
});

popup.addEventListener("click", function(e) {
    if (e.target === popup) {
        popup.classList.remove("active");
    }
});

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




function setAlign(align) {
    textarea.className = "align-" + align;
    document.cookie = ALIGN_COOKIE + "=" + align + "; path=/; max-age=31536000";
    alignToggle.textContent = align === "left" ? "Align Right" : "Align Left";
}


function loadAlign() {
    const cookies = document.cookie.split("; ");
    for (let c of cookies) {
        const [name, value] = c.split("=");
        if (name === ALIGN_COOKIE) {
            setAlign(value);
            return;
        }
    }
    setAlign("right");
}

alignToggle.addEventListener("click", function () {
    const isLeft = textarea.classList.contains("align-left");
    setAlign(isLeft ? "right" : "left");
});


function setFontSize(size) {
    textarea.style.fontSize = size + "px";
    document.cookie = FONTSIZE_COOKIE + "=" + size + "; path=/; max-age=31536000";
}

function loadFontSize() {
    const cookies = document.cookie.split("; ");
    for (let c of cookies) {
        const [name, value] = c.split("=");
        if (name === FONTSIZE_COOKIE) {
            setFontSize(parseInt(value));
            return;
        }
    }
    setFontSize(50);
}

sizeIncrease.addEventListener("click", function() {
    const currentSize = parseInt(window.getComputedStyle(textarea).fontSize);
    setFontSize(currentSize + 1);
});

sizeDecrease.addEventListener("click", function() {
    const currentSize = parseInt(window.getComputedStyle(textarea).fontSize);
    if (currentSize > 8) {
        setFontSize(currentSize - 1);
    }
});

sizeReset.addEventListener("click", function() {
    setFontSize(50);
});

window.addEventListener("DOMContentLoaded", function() {
    loadFromCookie();
    loadTheme();
    loadAlign();
    loadFontSize();
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

// Source - https://stackoverflow.com/a/67987248
// Posted by programmerRaj
// Retrieved 2026-02-27, License - CC BY-SA 4.0

fetch('https://api.github.com/repos/rhhen122/minipad/commits?per_page=1')
  .then(res => res.json())
  .then(res => {
    document.getElementById('commit-message').innerHTML = res[0].commit.message
  })