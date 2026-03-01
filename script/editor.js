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
