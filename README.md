<img src="https://github.com/rhhen122/minipad/blob/main/images/readme_logo.png?raw=true" height="60px"/> (alpha)

### the true light weight text editor...

> [!IMPORTANT]
> minipad is prone to bugs as it is only in alpha and currently rolling release.

minipad is a simple and *beautiful* browser-based text editor for people who want something secure and something that just... *works.*

---

## Features

- **Notes** — Multiple notes stored only in your browser (localStorage). No account, no server storage. Create, rename, switch, and delete notes from the Notes panel.
- **Theme** — Light / dark mode (saved in a cookie).
- **Alignment** — Left or right text alignment (saved in a cookie).
- **Font size** — Increase, decrease, or reset (saved in a cookie).
- **Import / Export** — Load `.txt` files or export the current note as `minipad.txt`.
- **Drag & drop** — Drop a text file onto the pad to import it.

All note content and preferences are stored locally in your browser; nothing is sent to any server.

---

## Tech

- Vanilla HTML, CSS, and JavaScript (ES modules).
- No build step and no framework. Open `index.html` in a browser or serve the folder as static files.
- Scripts are split by responsibility:
  - `script/storage.js` — Cookie and localStorage helpers
  - `script/notes.js` — Notes CRUD and panel UI
  - `script/preferences.js` — Theme, alignment, font size
  - `script/editor.js` — Pad content, import/export, drag-and-drop
  - `script/ui.js` — About popup, loading overlay, GitHub commit info
  - `script/main.js` — Entry point that wires everything together

---

## Run locally

Serve the project as static files (e.g. with your editor’s live server, or):

```bash
# Python
python -m http.server 8000

# Node (npx)
npx serve .
```

Then open `http://localhost:8000` (or the port your server uses).

---

## Deploy (Vercel)

The app is static. Deploy the repo to [Vercel](https://vercel.com); no environment variables or build step are required. Notes and settings stay in the user’s browser.

---

## Thanks

- [DigitalPlatDev/FreeDomain](https://github.com/DigitalPlatDev/FreeDomain)
- [Google Fonts](https://fonts.google.com/) (Google Sans Flex)
- [SVG Repo](http://svgrepo.com/)
- [Cloudflare](https://www.cloudflare.com/)
- [Vercel](https://vercel.com/)
