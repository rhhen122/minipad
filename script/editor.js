/**
 * Pad content: import, export, textarea input, drag-and-drop.
 */

export function createEditor(textarea, fileInput, callbacks) {
    const { setContentCookie, saveCurrentNoteToStorage } = callbacks;

    function saveToCookie() {
        setContentCookie(textarea.value);
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
            saveCurrentNoteToStorage();
        };
        reader.readAsText(file);
    });

    textarea.addEventListener("input", function () {
        saveToCookie();
        saveCurrentNoteToStorage();
    });

    function handleFileDrop(file) {
        if (!file) return;
        const isText = !file.type || file.type.startsWith("text") || file.name.toLowerCase().endsWith(".txt");
        if (!isText) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            textarea.value = e.target.result;
            saveToCookie();
            saveCurrentNoteToStorage();
        };
        reader.readAsText(file);
    }

    document.addEventListener("dragover", function (e) {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    });

    document.addEventListener("drop", function (e) {
        e.preventDefault();
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) handleFileDrop(f);
    });

    textarea.addEventListener("dragover", function (e) {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
        textarea.classList.add("drag-over");
    });

    textarea.addEventListener("dragleave", function () {
        textarea.classList.remove("drag-over");
    });

    textarea.addEventListener("drop", function (e) {
        e.preventDefault();
        textarea.classList.remove("drag-over");
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) handleFileDrop(f);
    });

    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) exportBtn.addEventListener("click", downloadText);

    const importBtn = document.getElementById("importBtn");
    if (importBtn) importBtn.addEventListener("click", () => fileInput.click());

    return { saveToCookie, downloadText };
}

export function createVimMode(textarea) {
    let enabled = false;
    let keyboardLayout = "qwerty";
    let mode = "normal";

    const layoutToQwerty = {
        colemak: {
        f: "e", p: "r", g: "t", j: "y", l: "u", u: "i", y: "o", ";": "p",
        r: "s", s: "d", t: "f", d: "g", n: "j", e: "k", i: "l", o: ";"
        },
        dvorak: {
            "'": "q", ",": "w", ".": "e", p: "r", y: "t", f: "y", g: "u", c: "i", r: "o", l: "p",
            a: "a", o: "s", e: "d", u: "f", i: "g", d: "h", h: "j", t: "k", n: "l", s: ";",
            ";": "z", q: "x", j: "c", k: "v", x: "b", b: "n", m: "m", w: ",", v: "."
        },
        azerty: { a: "q", z: "w", m: ";" }
    };

    const colemakCodeToQwerty = {
        KeyQ: "q", KeyW: "w", KeyE: "e", KeyR: "r", KeyT: "t", KeyY: "y", KeyU: "u", KeyI: "i", KeyO: "o", KeyP: "p",
        KeyA: "a", KeyS: "s", KeyD: "d", KeyF: "f", KeyG: "g", KeyH: "h", KeyJ: "j", KeyK: "k", KeyL: "l",
        KeyZ: "z", KeyX: "x", KeyC: "c", KeyV: "v", KeyB: "b", KeyN: "n", KeyM: "m",
        Semicolon: ";", Comma: ",", Period: ".", Slash: "/"
    };

    function commandKey(key, code) {
        if (keyboardLayout === "colemak" && colemakCodeToQwerty[code]) {
            const mappedKey = colemakCodeToQwerty[code];
            const isUppercase = key === key.toUpperCase() && key !== key.toLowerCase();
            return isUppercase ? mappedKey.toUpperCase() : mappedKey;
        }
        if (keyboardLayout === "qwerty" || key.length !== 1) return key;
        const lowerKey = key.toLowerCase();
        const mappedKey = layoutToQwerty[keyboardLayout][lowerKey];
        if (!mappedKey) return key;
        const isUppercase = key === key.toUpperCase() && key !== key.toLowerCase();
        return isUppercase ? mappedKey.toUpperCase() : mappedKey;
    }

    function updateMode(nextMode) {
        mode = nextMode;
        textarea.readOnly = enabled && mode === "normal";
        textarea.dataset.vimMode = enabled ? mode : "off";
        textarea.setAttribute("aria-label", enabled ? "Editor, Vim " + mode + " mode" : "Editor");
    }

    function moveTo(position) {
        textarea.setSelectionRange(position, position);
    }

    function showBlockCursor(position) {
        const valueLength = textarea.value.length;
        if (!valueLength) {
            moveTo(0);
            return;
        }
        const start = Math.max(0, Math.min(position, valueLength - 1));
        textarea.setSelectionRange(start, start + 1);
    }

    function replaceText(text, start, end) {
        textarea.setRangeText(text, start, end, "end");
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function lineStart(position) {
        const start = textarea.value.lastIndexOf("\n", position - 1) + 1;
        return start;
    }

    function lineEnd(position) {
        const end = textarea.value.indexOf("\n", position);
        return end === -1 ? textarea.value.length : end;
    }

    function enterInsert(position) {
        moveTo(Math.max(0, Math.min(position, textarea.value.length)));
        updateMode("insert");
    }

    function handleNormalKey(event) {
        const position = textarea.selectionStart;
        const value = textarea.value;
        const key = commandKey(event.key, event.code);
        let nextPosition = position;

        if (key === "Escape") return;
        if (key === "i") enterInsert(position);
        else if (key === "a") enterInsert(position + (position < value.length ? 1 : 0));
        else if (key === "A") enterInsert(lineEnd(position));
        else if (key === "I") enterInsert(lineStart(position));
        else if (key === "o") {
            const end = lineEnd(position);
            replaceText("\n", end, end);
            enterInsert(end + 1);
        } else if (key === "O") {
            const start = lineStart(position);
            replaceText("\n", start, start);
            enterInsert(start);
        } else if (key === "h" || key === "ArrowLeft") nextPosition--;
        else if (key === "l" || key === "ArrowRight") nextPosition++;
        else if (key === "k" || key === "ArrowUp") {
            const column = position - lineStart(position);
            const previousEnd = lineStart(position) - 1;
            if (previousEnd >= 0) nextPosition = Math.min(lineStart(previousEnd), lineStart(previousEnd) + column);
        } else if (key === "j" || key === "ArrowDown") {
            const column = position - lineStart(position);
            const nextStart = lineEnd(position) + 1;
            if (nextStart <= value.length) nextPosition = Math.min(lineEnd(nextStart), nextStart + column);
        } else if (key === "0" || key === "Home") nextPosition = lineStart(position);
        else if (key === "$" || key === "End") nextPosition = Math.max(lineStart(position), lineEnd(position) - 1);
        else if (key === "w") {
            const match = value.slice(position).match(/\s*\S+/);
            nextPosition = match ? position + match[0].length : value.length;
        } else if (key === "b") {
            const before = value.slice(0, position).match(/\S+\s*$/);
            nextPosition = before ? position - before[0].length : 0;
        } else if (key === "x") {
            replaceText("", position, Math.min(position + 1, value.length));
        } else if (key === "d") {
            if (textarea.dataset.vimPending === "d") {
                const start = lineStart(position);
                const end = lineEnd(position) + (lineEnd(position) < value.length ? 1 : 0);
                replaceText("", start, end);
                delete textarea.dataset.vimPending;
            } else {
                textarea.dataset.vimPending = "d";
            }
        } else if (key === "u") {
            document.execCommand("undo");
        } else {
            return;
        }

        event.preventDefault();
        if (mode === "normal" && (key !== "d" || !textarea.dataset.vimPending)) {
            showBlockCursor(Math.max(0, Math.min(nextPosition, textarea.value.length)));
        }
    }

    textarea.addEventListener("keydown", function (event) {
        if (!enabled) return;
        if (mode === "insert") {
            if (event.key === "Escape") {
                event.preventDefault();
                updateMode("normal");
                showBlockCursor(Math.max(0, textarea.selectionStart - 1));
            }
            return;
        }
        handleNormalKey(event);
    });

    textarea.addEventListener("click", function () {
        if (enabled && mode === "normal") showBlockCursor(textarea.selectionStart);
    });

    function setEnabled(value) {
        enabled = value;
        delete textarea.dataset.vimPending;
        updateMode(enabled ? "normal" : "off");
        if (enabled) showBlockCursor(textarea.selectionStart);
        else moveTo(textarea.selectionStart);
    }

    function setKeyboardLayout(layout) {
        keyboardLayout = layoutToQwerty[layout] ? layout : "qwerty";
        delete textarea.dataset.vimPending;
        textarea.dataset.keyboardLayout = keyboardLayout;
        if (enabled && mode === "normal") showBlockCursor(textarea.selectionStart);
    }

    updateMode("off");
    return { setEnabled, setKeyboardLayout };
}
