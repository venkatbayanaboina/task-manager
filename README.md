# Task Manager — by Nani Bayanaboina

> A fast, beautiful task management web app built with pure HTML, CSS & Vanilla JavaScript.

🌐 **Live at → [letsdoitnani.netlify.app](https://letsdoitnani.netlify.app)**

---

## Overview

Task Manager is a fully client-side productivity app with a clean, modern interface. It supports task priorities, smart filters, drag-and-drop reordering, and three carefully crafted themes — all with zero frameworks or dependencies.

Every task is saved to your browser's localStorage, so your data persists across sessions without any server or account needed.

---

## Features

| Feature | Detail |
|---|---|
| ✅ Add / Edit / Delete | Inline double-click editing, fall animation on delete |
| 🎯 Priority Levels | High · Med · Low — colour-coded left border on each card |
| 🗂️ Filter Tabs | All · Active · Done with live count badges |
| 🔀 Drag & Drop | Reorder tasks by dragging — order saved automatically |
| 🔃 Sort by Priority | One click sorts High → Med → Low |
| 🗑️ Clear Completed | Remove all done tasks at once |
| 📊 Progress Bar | Visual completion tracker |
| 🕐 Live Clock | Updates every second |
| 🎨 3 Themes | Standard (Purple) · Light (Indigo) · Darker (Cyan) |
| 💾 Persistent Storage | Tasks, theme & order survive page reloads |
| 📱 Responsive | Works on mobile, tablet and desktop |
| ⚡ Zero Dependencies | No frameworks, no build tools, no installs |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 (semantic) |
| Styling | Vanilla CSS3 — custom properties, Flexbox, keyframe animations |
| Logic | Vanilla JavaScript ES6+ |
| Font | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts CDN |
| Storage | Browser localStorage API |

---

## Project Structure

```
task-manager/
├── index.html        — App entry point
├── CSS/
│   └── main.css      — All styles + 3 theme palettes via CSS variables
├── JS/
│   ├── main.js       — Core logic (tasks, filters, drag-drop, themes)
│   └── time.js       — Live clock
├── assets/
│   └── favicon.png
├── README.md
└── LICENSE
```

---

## Author

**Nani Bayanaboina**
GitHub → [github.com/venkatbayanaboina](https://github.com/venkatbayanaboina)

---

## License

MIT © Nani Bayanaboina
