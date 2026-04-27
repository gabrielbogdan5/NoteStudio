<div align="center">

# ✦ NoteStudio

**A beautifully crafted, offline-first notes app — built as a single HTML file.**

[![License: MIT](https://img.shields.io/badge/License-MIT-b78fff?style=flat-square)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-64e0c8?style=flat-square&logo=googlechrome&logoColor=white)](https://notestudio.app)
[![Offline](https://img.shields.io/badge/Works-Offline-b78fff?style=flat-square&logo=serviceworker&logoColor=white)](#)
[![AdMob](https://img.shields.io/badge/Ads-AdMob-64e0c8?style=flat-square&logo=google&logoColor=white)](#)
[![Language](https://img.shields.io/badge/Language-EN%20%7C%20RO-b78fff?style=flat-square)](#)

<br/>

![NoteStudio Banner](feature-graphic.html)

*Dark · Light · Sepia — your notes, your way.*

</div>

---

## ✦ Overview

NoteStudio is a **single-file PWA** note-taking app with a rich text editor, multiple themes, and full offline support. No account needed. No data leaves your device. Just open and write.

> All notes are stored locally in your browser using `localStorage`. Nothing is ever sent to a server.

---

## ✦ Features

| | Feature | Description |
|---|---|---|
| 📝 | **Rich Text Editor** | Bold, italic, underline, colors, fonts, headings, lists, alignment |
| 🎨 | **3 Themes** | Dark, Light, Sepia — persisted across sessions |
| 🔍 | **Note Search** | Instant search across all notes |
| 💾 | **Auto-Save** | Notes save automatically as you type |
| 📤 | **Export to .docx** | Download any note as a Word document |
| 📶 | **Offline Support** | Full PWA with Service Worker — works without internet |
| 🌍 | **Bilingual** | English (primary) & Romanian — switch anytime in settings |
| 🎨 | **Color-coded Notes** | Assign colors to notes for quick visual organization |
| ⌨️ | **Keyboard Shortcuts** | `Ctrl+S` save · `Ctrl+N` new note · `Ctrl+B` bold · `Ctrl+I` italic |
| 📱 | **Mobile Friendly** | Collapsible sidebar and toolbar optimized for small screens |

---

## ✦ Screenshots

<div align="center">

| Dark Theme | Light Theme | Sepia Theme |
|:---:|:---:|:---:|
| *(dark)* | *(light)* | *(sepia)* |

</div>

---

## ✦ Getting Started

### Option 1 — GitHub Pages (recommended)

1. Fork this repository
2. Go to **Settings → Pages**
3. Set source to `main` branch → `/ (root)`
4. Visit `https://gabrielbogdan5.github.io/NoteStudio/`

### Option 2 — Run locally

```bash
git clone https://github.com/gabrielbogdan5/NoteStudio.git
cd NoteStudio

# Any static server works, e.g.:
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

### Option 3 — Just open the file

Download `index.html` and open it directly in any modern browser. Service Worker and PWA features require a server, but the core app works offline either way.

---

## ✦ File Structure

```
NoteStudio/
├── index.html          # The entire app — self-contained
├── sw.js               # Service Worker (offline support, cache strategies)
├── manifest.json       # PWA manifest (icons, theme, display mode)
├── icon-192x192.png    # App icon
├── icon-512x512.png    # App icon (large)
├── privacy-policy.html # Privacy policy page
└── feature-graphic.html# Google Play feature graphic
```

---

## ✦ PWA & Offline Support

NoteStudio uses a **three-strategy Service Worker**:

- **Cache-First** — app shell (HTML, icons, manifest) served instantly from cache
- **Stale-While-Revalidate** — Google Fonts and CDN assets updated silently in background
- **Network-First** — all other requests, with cache fallback when offline
- **AdMob bypass** — ad network requests are never intercepted (required for ads to work correctly)

After the first visit, the app works **fully offline**.

---

## ✦ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + S` | Save note |
| `Ctrl + N` | New note |
| `Ctrl + B` | Bold |
| `Ctrl + I` | Italic |

---

## ✦ Privacy

NoteStudio takes privacy seriously:

- ✅ **No account required**
- ✅ **No data sent to any server**
- ✅ **Notes stored only on your device** (`localStorage`)
- ℹ️ The free version displays ads via **Google AdMob**, which may collect device identifiers per [Google's Privacy Policy](https://policies.google.com/privacy)

→ Full privacy policy: [privacy-policy.html](privacy-policy.html)

---

## ✦ Tech Stack

| Technology | Purpose |
|---|---|
| Vanilla HTML / CSS / JS | Core app — zero dependencies |
| `localStorage` | Note & preference persistence |
| Service Worker API | Offline support & caching |
| Web App Manifest | PWA installability |
| [docx.js](https://github.com/dolanmiu/docx) | Word document export |
| Google AdMob | Monetization (free version) |
| Google Fonts | Typography (DM Sans, Playfair Display) |

---

## ✦ Browser Support

| Browser | Support |
|---|---|
| Chrome / Edge | ✅ Full |
| Firefox | ✅ Full |
| Safari (iOS) | ✅ Full |
| Samsung Internet | ✅ Full |

---

## ✦ License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## ✦ Contact

Have a question, bug report, or feature request?

📧 **[notestudiocontact@gmail.com](mailto:notestudiocontact@gmail.com)**

---

<div align="center">

Made with ♥ by the NoteStudio team · © 2025 NoteStudio

</div>
