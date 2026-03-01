/**
 * Theme, text alignment, and font size.
 * Persisted via cookies.
 */

import { THEME_COOKIE, ALIGN_COOKIE, FONTSIZE_COOKIE } from "./storage.js";

function readCookie(name) {
    const cookies = document.cookie.split("; ");
    for (const c of cookies) {
        const [n, value] = c.split("=");
        if (n.trim() === name) return value;
    }
    return null;
}

export function createPreferences(elements) {
    const { textarea, themeToggle, alignToggle, sizeIncrease, sizeDecrease, sizeReset } = elements;

    function setTheme(theme) {
        document.body.className = theme;
        document.cookie = THEME_COOKIE + "=" + theme + "; path=/; max-age=31536000";
        themeToggle.textContent = theme === "dark" ? "Light" : "Dark";
    }

    function loadTheme() {
        const value = readCookie(THEME_COOKIE);
        if (value) setTheme(value);
        else setTheme("light");
    }

    function setAlign(align) {
        textarea.className = "align-" + align;
        document.cookie = ALIGN_COOKIE + "=" + align + "; path=/; max-age=31536000";
        alignToggle.textContent = align === "left" ? "Align Right" : "Align Left";
    }

    function loadAlign() {
        const value = readCookie(ALIGN_COOKIE);
        if (value) setAlign(value);
        else setAlign("right");
    }

    function setFontSize(size) {
        textarea.style.fontSize = size + "px";
        document.cookie = FONTSIZE_COOKIE + "=" + size + "; path=/; max-age=31536000";
    }

    function loadFontSize() {
        const value = readCookie(FONTSIZE_COOKIE);
        if (value) setFontSize(parseInt(value, 10));
        else setFontSize(50);
    }

    themeToggle.addEventListener("click", function () {
        const isDark = document.body.classList.contains("dark");
        setTheme(isDark ? "light" : "dark");
    });

    alignToggle.addEventListener("click", function () {
        const isLeft = textarea.classList.contains("align-left");
        setAlign(isLeft ? "right" : "left");
    });

    sizeIncrease.addEventListener("click", function () {
        const currentSize = parseInt(window.getComputedStyle(textarea).fontSize, 10);
        setFontSize(currentSize + 1);
    });

    sizeDecrease.addEventListener("click", function () {
        const currentSize = parseInt(window.getComputedStyle(textarea).fontSize, 10);
        if (currentSize > 8) setFontSize(currentSize - 1);
    });

    sizeReset.addEventListener("click", function () {
        setFontSize(50);
    });

    return { loadTheme, loadAlign, loadFontSize };
}
