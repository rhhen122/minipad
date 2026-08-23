/**
 * Entry point: wires DOM elements and modules.
 * All init runs on DOMContentLoaded so the DOM is ready (fixes deployment/loading order).
 */

import { setContentCookie } from "./storage.js";
import { createNotes } from "./notes.js";
import { createPreferences } from "./preferences.js";
import { createEditor, createVimMode } from "./editor.js";
import { initUI } from "./ui.js";

function init() {
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
    const vimToggle = document.getElementById("vimToggle");
    const layoutToggle = document.getElementById("layoutToggle");
    const layoutOptions = document.getElementById("layoutOptions");
    const loading = document.getElementById("loading");

    if (!textarea || !fileInput) return;

    const notes = createNotes(textarea);
    const { loadFromCookie, saveCurrentNoteToStorage } = notes;

    const vim = createVimMode(textarea);
    const preferences = createPreferences({
        textarea,
        themeToggle,
        alignToggle,
        sizeIncrease,
        sizeDecrease,
        sizeReset,
        vimToggle,
        setVimEnabled: vim.setEnabled,
        layoutToggle,
        layoutOptions,
        setKeyboardLayout: vim.setKeyboardLayout,
    });

    createEditor(textarea, fileInput, {
        setContentCookie: (value) => setContentCookie(value),
        saveCurrentNoteToStorage,
    });

    initUI({ logoBtn, popup, closePopup, loading });

    loadFromCookie();
    preferences.loadTheme();
    preferences.loadAlign();
    preferences.loadFontSize();
    preferences.loadVim();
    preferences.loadKeyboardLayout();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
