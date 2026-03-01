/**
 * Entry point: wires DOM elements and modules.
 */

import { setContentCookie } from "./storage.js";
import { createNotes } from "./notes.js";
import { createPreferences } from "./preferences.js";
import { createEditor } from "./editor.js";
import { initUI } from "./ui.js";

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
const loading = document.getElementById("loading");

const notes = createNotes(textarea);
const { loadFromCookie, saveCurrentNoteToStorage } = notes;

const preferences = createPreferences({
    textarea,
    themeToggle,
    alignToggle,
    sizeIncrease,
    sizeDecrease,
    sizeReset,
});

createEditor(textarea, fileInput, {
    setContentCookie: (value) => setContentCookie(value),
    saveCurrentNoteToStorage,
});

initUI({ logoBtn, popup, closePopup, loading });

window.addEventListener("DOMContentLoaded", function () {
    loadFromCookie();
    preferences.loadTheme();
    preferences.loadAlign();
    preferences.loadFontSize();
});
