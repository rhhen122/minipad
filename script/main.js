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

// Popup elements
const aboutTab = document.getElementById("aboutTab");
const authTab = document.getElementById("authTab");
const aboutTabBtn = document.getElementById("aboutTabBtn");
const authTabBtn = document.getElementById("authTabBtn");

// Auth elements
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const notesView = document.getElementById("notesView");

const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const toggleRegister = document.getElementById("toggleRegister");

const regUsername = document.getElementById("regUsername");
const regPassword = document.getElementById("regPassword");
const regPasswordConfirm = document.getElementById("regPasswordConfirm");
const registerBtn = document.getElementById("registerBtn");
const registerError = document.getElementById("registerError");
const toggleLogin = document.getElementById("toggleLogin");

const logoutBtn = document.getElementById("logoutBtn");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const noteError = document.getElementById("noteError");
const notesList = document.getElementById("notesList");

const CONTENT_COOKIE = "minipadContent";
const THEME_COOKIE = "minipadTheme";
const ALIGN_COOKIE = "minipadAlign";
const FONTSIZE_COOKIE = "minipadFontSize";
const AUTH_TOKEN_COOKIE = "minipadAuthToken";
const USERNAME_COOKIE = "minipadUsername";

// Detect environment - use Vercel URL in production, localhost in development
const isProduction = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');
const API_URL = isProduction 
  ? window.location.origin + '/api' 
  : "http://localhost:3000/api";

let currentUser = null;
let authToken = null;

// ========== Cookie Management ==========
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

function saveAuthToken(token, username) {
    document.cookie = AUTH_TOKEN_COOKIE + "=" + token + "; path=/; max-age=604800";
    document.cookie = USERNAME_COOKIE + "=" + username + "; path=/; max-age=604800";
    authToken = token;
    currentUser = username;
}

function loadAuthToken() {
    const cookies = document.cookie.split("; ");
    for (let c of cookies) {
        const [name, value] = c.split("=");
        if (name === AUTH_TOKEN_COOKIE) {
            authToken = value;
        }
        if (name === USERNAME_COOKIE) {
            currentUser = value;
        }
    }
}

function clearAuthToken() {
    document.cookie = AUTH_TOKEN_COOKIE + "=; path=/; max-age=0";
    document.cookie = USERNAME_COOKIE + "=; path=/; max-age=0";
    authToken = null;
    currentUser = null;
}

// ========== Export/Import ==========
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

// ========== Popup Functionality ==========
logoBtn.addEventListener("click", function() {
    popup.classList.add("active");
    if (authToken) {
        showAuthTab();
    } else {
        showAboutTab();
    }
});

closePopup.addEventListener("click", function() {
    popup.classList.remove("active");
});

popup.addEventListener("click", function(e) {
    if (e.target === popup) {
        popup.classList.remove("active");
    }
});

// ========== Tab Navigation ==========
function showAboutTab() {
    aboutTab.classList.add("active");
    authTab.classList.remove("active");
    aboutTabBtn.classList.add("active");
    authTabBtn.classList.remove("active");
}

function showAuthTab() {
    authTab.classList.add("active");
    aboutTab.classList.remove("active");
    authTabBtn.classList.add("active");
    aboutTabBtn.classList.remove("active");
}

aboutTabBtn.addEventListener("click", showAboutTab);
authTabBtn.addEventListener("click", showAuthTab);

// ========== Theme Management ==========
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

// ========== Alignment Management ==========
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

// ========== Font Size Management ==========
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

// ========== Authentication ==========
toggleRegister.addEventListener("click", function() {
    loginForm.style.display = "none";
    registerForm.style.display = "flex";
    loginError.textContent = "";
});

toggleLogin.addEventListener("click", function() {
    registerForm.style.display = "none";
    loginForm.style.display = "flex";
    registerError.textContent = "";
});

loginBtn.addEventListener("click", async function() {
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();
    
    if (!username || !password) {
        loginError.textContent = "Please enter username and password";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            loginError.textContent = data.error || "Login failed";
            return;
        }

        saveAuthToken(data.token, data.username);
        loginUsername.value = "";
        loginPassword.value = "";
        loginError.textContent = "";
        
        updateUIAfterLogin();
        loadNotes();
    } catch (error) {
        loginError.textContent = "Connection error. Make sure the server is running.";
        console.error("Login error:", error);
    }
});

registerBtn.addEventListener("click", async function() {
    const username = regUsername.value.trim();
    const password = regPassword.value.trim();
    const confirmPassword = regPasswordConfirm.value.trim();

    if (!username || !password) {
        registerError.textContent = "Please enter username and password";
        return;
    }

    if (password !== confirmPassword) {
        registerError.textContent = "Passwords do not match";
        return;
    }

    if (password.length < 6) {
        registerError.textContent = "Password must be at least 6 characters";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            registerError.textContent = data.error || "Registration failed";
            return;
        }

        regUsername.value = "";
        regPassword.value = "";
        regPasswordConfirm.value = "";
        registerError.textContent = "";
        
        registerForm.style.display = "none";
        loginForm.style.display = "flex";
        loginError.textContent = "Registration successful! Please login.";
    } catch (error) {
        registerError.textContent = "Connection error. Make sure the server is running.";
        console.error("Register error:", error);
    }
});

logoutBtn.addEventListener("click", function() {
    clearAuthToken();
    noteTitle.value = "";
    noteContent.value = "";
    noteError.textContent = "";
    notesList.innerHTML = "";
    
    loginForm.style.display = "flex";
    registerForm.style.display = "none";
    notesView.style.display = "none";
    loginUsername.value = "";
    loginPassword.value = "";
});

function updateUIAfterLogin() {
    loginForm.style.display = "none";
    registerForm.style.display = "none";
    notesView.style.display = "block";
}

// ========== Notes Management ==========
async function loadNotes() {
    if (!authToken) return;

    try {
        const response = await fetch(`${API_URL}/notes`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });

        if (!response.ok) {
            noteError.textContent = "Failed to load notes";
            return;
        }

        const notes = await response.json();
        displayNotes(notes);
    } catch (error) {
        noteError.textContent = "Connection error";
        console.error("Load notes error:", error);
    }
}

function displayNotes(notes) {
    if (notes.length === 0) {
        notesList.innerHTML = '<div class="empty-notes">No notes yet. Create your first note!</div>';
        return;
    }

    notesList.innerHTML = notes.map(note => `
        <div class="note-item" onclick="loadNoteForEditing('${note._id}', '${note.title.replace(/'/g, "\\'")}', '${note.content.replace(/'/g, "\\'").replace(/\n/g, "\\n")}')">
            <h3>${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(note.content.substring(0, 80))}</p>
            <div class="note-date">${new Date(note.createdAt).toLocaleDateString()}</div>
            <button class="note-delete-btn" onclick="deleteNote(event, '${note._id}')">Delete</button>
            <div style="clear: both;"></div>
        </div>
    `).join("");
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function loadNoteForEditing(id, title, content) {
    noteTitle.value = title;
    noteContent.value = content;
    noteContent.dataset.noteId = id;
}

saveNoteBtn.addEventListener("click", async function() {
    const title = noteTitle.value.trim() || "Untitled";
    const content = noteContent.value.trim();
    const noteId = noteContent.dataset.noteId;

    if (!content) {
        noteError.textContent = "Please enter note content";
        return;
    }

    try {
        let response, data;

        if (noteId) {
            // Update existing note
            response = await fetch(`${API_URL}/notes?id=${noteId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ title, content })
            });
            data = await response.json();
        } else {
            // Create new note
            response = await fetch(`${API_URL}/notes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ title, content })
            });
            data = await response.json();
        }

        if (!response.ok) {
            noteError.textContent = data.error || "Failed to save note";
            return;
        }

        noteTitle.value = "";
        noteContent.value = "";
        delete noteContent.dataset.noteId;
        noteError.textContent = "";
        
        loadNotes();
    } catch (error) {
        noteError.textContent = "Connection error";
        console.error("Save note error:", error);
    }
});

async function deleteNote(event, noteId) {
    event.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
        const response = await fetch(`${API_URL}/notes?id=${noteId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${authToken}` }
        });

        if (!response.ok) {
            noteError.textContent = "Failed to delete note";
            return;
        }

        loadNotes();
    } catch (error) {
        noteError.textContent = "Connection error";
        console.error("Delete note error:", error);
    }
}

// ========== Loading and Initialization ==========
function hideLoadingAnimation() {
    const loader = document.getElementById("loading");
    if (loader) {
        loader.classList.add("hidden");
    }
}

window.addEventListener("DOMContentLoaded", function() {
    loadFromCookie();
    loadTheme();
    loadAlign();
    loadFontSize();
    loadAuthToken();
    
    if (authToken) {
        updateUIAfterLogin();
        loadNotes();
    }
});

window.addEventListener("load", function() {
    hideLoadingAnimation();
});

// ========== Drag & Drop ==========
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

// ========== GitHub Commit Info ==========
fetch('https://api.github.com/repos/rhhen122/minipad/commits?per_page=1')
  .then(res => res.json())
  .then(res => {
    if (res[0]) {
      document.getElementById('commit-message').innerHTML = res[0].commit.message;
    }
  })
  .catch(err => console.log('Could not fetch commit info'));
