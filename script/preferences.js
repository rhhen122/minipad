/**
 * Theme, text alignment, and font size.
 * Persisted via cookies.
 */

import { THEME_COOKIE, ALIGN_COOKIE, FONTSIZE_COOKIE, VIM_COOKIE, COLEMAK_COOKIE, KEYBOARD_LAYOUT_COOKIE } from "./storage.js";

function readCookie(name) {
    const cookies = document.cookie.split("; ");
    for (const c of cookies) {
        const [n, value] = c.split("=");
        if (n.trim() === name) return value;
    }
    return null;
}

export function createPreferences(elements) {
    const { textarea, themeToggle, alignToggle, sizeIncrease, sizeDecrease, sizeReset, vimToggle, setVimEnabled, layoutToggle, layoutOptions, setKeyboardLayout } = elements;

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

    function setVim(value) {
        const enabled = value === true || value === "true";
        setVimEnabled(enabled);
        vimToggle.textContent = enabled ? "Vim: On" : "Vim: Off";
        layoutToggle.hidden = !enabled;
        if (!enabled) {
            layoutOptions.classList.remove("active");
            layoutToggle.setAttribute("aria-expanded", "false");
        }
        document.cookie = VIM_COOKIE + "=" + enabled + "; path=/; max-age=31536000";
    }

    function loadVim() {
        setVim(readCookie(VIM_COOKIE) === "true");
    }

    function setKeyboard(value) {
        const layout = ["qwerty", "colemak", "dvorak", "azerty"].includes(value) ? value : "qwerty";
        setKeyboardLayout(layout);
        layoutToggle.textContent = "Layout: " + layout.toUpperCase();
        layoutToggle.setAttribute("aria-expanded", "false");
        layoutOptions.classList.remove("active");
        document.cookie = KEYBOARD_LAYOUT_COOKIE + "=" + layout + "; path=/; max-age=31536000";
    }

    function loadKeyboardLayout() {
        const savedLayout = readCookie(KEYBOARD_LAYOUT_COOKIE);
        const legacyLayout = readCookie(COLEMAK_COOKIE) === "true" ? "colemak" : "qwerty";
        setKeyboard(savedLayout || legacyLayout);
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

    vimToggle.addEventListener("click", function () {
        setVim(vimToggle.textContent !== "Vim: On");
    });

    layoutToggle.addEventListener("click", function () {
        const isOpen = layoutOptions.classList.toggle("active");
        layoutToggle.setAttribute("aria-expanded", String(isOpen));
    });

    layoutOptions.addEventListener("click", function (event) {
        if (event.target === layoutOptions) {
            layoutOptions.classList.remove("active");
            layoutToggle.setAttribute("aria-expanded", "false");
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && layoutOptions.classList.contains("active")) {
            layoutOptions.classList.remove("active");
            layoutToggle.setAttribute("aria-expanded", "false");
            layoutToggle.focus();
        }
    });

    layoutOptions.querySelectorAll("[data-layout]").forEach(function (option) {
        option.addEventListener("click", function () {
            setKeyboard(option.dataset.layout);
        });
    });

    return { loadTheme, loadAlign, loadFontSize, loadVim, loadKeyboardLayout };
}
