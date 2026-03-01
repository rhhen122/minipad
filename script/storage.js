/**
 * Cookie and localStorage keys and helpers.
 * No DOM dependency.
 */

export const CONTENT_COOKIE = "minipadContent";
export const THEME_COOKIE = "minipadTheme";
export const ALIGN_COOKIE = "minipadAlign";
export const FONTSIZE_COOKIE = "minipadFontSize";
export const NOTES_STORAGE_KEY = "minipadNotes";

export function getNotesData() {
    try {
        const raw = localStorage.getItem(NOTES_STORAGE_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            if (data.notes && Array.isArray(data.notes)) return data;
        }
    } catch (_) {}
    return { notes: [], activeId: null };
}

export function setNotesData(data) {
    try {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        // localStorage full, disabled, or private mode in some browsers
        if (typeof console !== "undefined" && console.warn) {
            console.warn("minipad: could not save notes to localStorage", e);
        }
    }
}

export function readContentCookie() {
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
        const parts = cookies[i].split("=");
        if (parts[0].trim() === CONTENT_COOKIE) {
            try { return decodeURIComponent(parts.slice(1).join("=").trim()); } catch (_) { return ""; }
        }
    }
    return "";
}

export function setContentCookie(value) {
    const text = encodeURIComponent(value);
    document.cookie = CONTENT_COOKIE + "=" + text + "; path=/; max-age=31536000";
}
