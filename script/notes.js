/**
 * Notes: localStorage CRUD, panel UI, rename, switch, delete.
 */

import { getNotesData, setNotesData, readContentCookie, setContentCookie } from "./storage.js";

export function createNotes(textarea) {
    if (!textarea) return { loadFromCookie: function () {}, saveCurrentNoteToStorage: function () {} };

    function saveToCookie() {
        setContentCookie(textarea.value);
    }

    function saveCurrentNoteToStorage() {
        const data = getNotesData();
        const active = data.notes.find((n) => n.id === data.activeId);
        if (active) {
            active.content = textarea.value;
            active.updatedAt = Date.now();
            setNotesData(data);
        }
    }

    function loadNoteIntoPad(note) {
        if (!note) return;
        textarea.value = note.content || "";
        saveToCookie();
    }

    function ensureAtLeastOneNote() {
        const data = getNotesData();
        if (data.notes.length === 0) {
            const legacyContent = readContentCookie();
            const first = {
                id: "n-" + Date.now(),
                title: "Note 1",
                content: legacyContent || "",
                updatedAt: Date.now(),
            };
            data.notes.push(first);
            data.activeId = first.id;
            setNotesData(data);
        } else if (!data.activeId || !data.notes.some((n) => n.id === data.activeId)) {
            data.activeId = data.notes[0].id;
            setNotesData(data);
        }
    }

    function loadFromCookie() {
        ensureAtLeastOneNote();
        const data = getNotesData();
        const active = data.notes.find((n) => n.id === data.activeId);
        loadNoteIntoPad(active);
    }

    function openNotesPanel() {
        saveCurrentNoteToStorage();
        renderNotesList();
        document.getElementById("notesPanel").classList.add("active");
    }

    function closeNotesPanel() {
        document.getElementById("notesPanel").classList.remove("active");
    }

    function renameNote(id, newTitle) {
        const data = getNotesData();
        const note = data.notes.find((n) => n.id === id);
        if (!note) return;
        note.title = (newTitle && newTitle.trim()) ? newTitle.trim() : "Untitled";
        setNotesData(data);
    }

    function startRename(note, titleEl) {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "note-rename-input";
        input.value = note.title || "Untitled";
        input.setSelectionRange(0, input.value.length);
        titleEl.replaceWith(input);
        input.focus();

        let cancelled = false;
        function finish() {
            if (cancelled) {
                titleEl.textContent = note.title || "Untitled";
                input.replaceWith(titleEl);
                return;
            }
            const value = input.value.trim();
            renameNote(note.id, value || "Untitled");
            titleEl.textContent = value || "Untitled";
            input.replaceWith(titleEl);
        }

        input.addEventListener("blur", finish);
        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                input.blur();
            }
            if (e.key === "Escape") {
                cancelled = true;
                input.blur();
            }
        });
    }

    function renderNotesList() {
        const data = getNotesData();
        const list = document.getElementById("notesList");
        if (!list) return;
        list.innerHTML = "";
        data.notes.forEach((note) => {
            const li = document.createElement("li");
            li.dataset.noteId = note.id;
            const title = document.createElement("span");
            title.className = "note-title";
            title.textContent = note.title || "Untitled";
            title.title = "Double-click to rename";
            title.addEventListener("dblclick", function (e) {
                e.stopPropagation();
                e.preventDefault();
                startRename(note, title);
            });
            const renameBtn = document.createElement("button");
            renameBtn.className = "note-rename-btn";
            renameBtn.textContent = "✎";
            renameBtn.title = "Rename note";
            renameBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                startRename(note, title);
            });
            const del = document.createElement("button");
            del.className = "note-delete";
            del.textContent = "×";
            del.title = "Delete note";
            del.addEventListener("click", function (e) {
                e.stopPropagation();
                deleteNote(note.id);
            });
            li.appendChild(title);
            li.appendChild(renameBtn);
            li.appendChild(del);
            li.addEventListener("click", function (e) {
                if (e.target.classList.contains("note-delete") || e.target.classList.contains("note-rename-btn") || e.target.classList.contains("note-rename-input")) return;
                switchToNote(note.id);
            });
            if (note.id === data.activeId) li.classList.add("active");
            list.appendChild(li);
        });
    }

    function switchToNote(id) {
        saveCurrentNoteToStorage();
        const data = getNotesData();
        const alreadyActive = data.activeId === id;
        data.activeId = id;
        setNotesData(data);
        const note = data.notes.find((n) => n.id === id);
        loadNoteIntoPad(note);
        if (!alreadyActive) {
            renderNotesList();
            closeNotesPanel();
        }
    }

    function deleteNote(id) {
        const data = getNotesData();
        const idx = data.notes.findIndex((n) => n.id === id);
        if (idx === -1) return;
        data.notes.splice(idx, 1);
        if (data.activeId === id) {
            data.activeId = data.notes.length ? data.notes[0].id : null;
            if (data.notes.length) loadNoteIntoPad(data.notes[0]);
            else textarea.value = "";
        }
        setNotesData(data);
        ensureAtLeastOneNote();
        const data2 = getNotesData();
        const active = data2.notes.find((n) => n.id === data2.activeId);
        loadNoteIntoPad(active);
        renderNotesList();
    }

    function addNewNote() {
        saveCurrentNoteToStorage();
        const data = getNotesData();
        const num = data.notes.length + 1;
        const note = {
            id: "n-" + Date.now(),
            title: "Note " + num,
            content: "",
            updatedAt: Date.now(),
        };
        data.notes.push(note);
        setNotesData(data);
        renderNotesList();
    }

    const notesBtn = document.getElementById("notesBtn");
    const notesPanelClose = document.getElementById("notesPanelClose");
    const newNoteBtn = document.getElementById("newNoteBtn");
    const notesPanel = document.getElementById("notesPanel");

    if (notesBtn) notesBtn.addEventListener("click", openNotesPanel);
    if (notesPanelClose) notesPanelClose.addEventListener("click", closeNotesPanel);
    if (newNoteBtn) newNoteBtn.addEventListener("click", addNewNote);
    if (notesPanel) {
        notesPanel.addEventListener("click", function (e) {
            if (e.target.id === "notesPanel") closeNotesPanel();
        });
    }

    return { loadFromCookie, saveCurrentNoteToStorage };
}
