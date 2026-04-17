# අක්ෂර · Akshara

> **Singlish → Sinhala Unicode & Legacy Font Converter**

Akshara is a modern, real-time web application that converts romanised Sinhala (Singlish) into:
- **Sinhala Unicode** — for use in modern apps, web, and documents
- **Legacy FM Abhaya** encoding — for use in older Sinhala desktop publishing workflows

---

## ✨ Features

- ⚡ **Real-time conversion** — output updates as you type
- 🔤 **Sinhala Unicode output** — standard Unicode Sinhala script
- 🖋️ **Legacy font output** — FM Abhaya / Bindumathi compatible encoding
- 📋 **One-click copy** — copy either output instantly to clipboard
- 🗺️ **Character map** — built-in reference sidebar for all Singlish key mappings
- 🎨 **Premium glassmorphism UI** — animated ambient background, mouse-reactive glow
- 🔣 **Smart punctuation handling** — periods, commas, and symbols render correctly in legacy output

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/desh2001/Unicode-Converter-26.git
cd Unicode-Converter-26

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

---

## 🔤 Singlish Typing Guide

Akshara follows the **Helakuru Smart Phonetic** standard.

### Vowels (independent)

| Singlish | Sinhala |
|----------|---------|
| `a`  | අ |
| `aa` | ආ |
| `A`  | ඇ |
| `i`  | ඉ |
| `ii` | ඊ |
| `u`  | උ |
| `uu` | ඌ |
| `e`  | එ |
| `ee` | ඒ |
| `o`  | ඔ |
| `oo` | ඕ |

### Key Consonant Rules

| Singlish | Sinhala |
|----------|---------|
| `k`  | ක් |
| `g`  | ග් |
| `t`  | ට් |
| `th` | ත් |
| `d`  | ඩ් |
| `dh` | ද් |
| `n`  | න් |
| `p`  | ප් |
| `b`  | බ් |
| `m`  | ම් |
| `y`  | ය් |
| `r`  | ර් |
| `l`  | ල් |
| `L`  | ළ් |
| `v` / `w` | ව් |
| `s`  | ස් |
| `sh` | ශ් |
| `Sh` | ෂ් |
| `h`  | හ් |
| `j`  | ජ් |
| `ch` | ච් |
| `f`  | ෆ් |

### Special Combinations

| Singlish | Sinhala |
|----------|---------|
| `ksha` | ක්ෂ |
| `shrii` | ශ්‍රී |
| `kru` | කෘ |
| `kruu` | කෲ |

> 💡 Open the **Character Map** (book icon in the header) for a full interactive reference.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build Tool | [Vite 8](https://vitejs.dev/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Styling | Vanilla CSS + Tailwind CSS v4 |
| Font | [Inter](https://fonts.google.com/specimen/Inter) (UI) · Bindumathi / FM Abhaya (legacy preview) |

---

## 📁 Project Structure

```
src/
├── assets/
│   ├── akshara.logo.png      # App logo
│   └── 4u-bindumathi.ttf     # Legacy Sinhala font
├── utils/
│   └── converter.ts          # Core Singlish → Unicode → Legacy engine
├── App.tsx                   # Main application UI
├── index.css                 # Global styles & font declarations
└── main.tsx                  # Entry point
```

---

## 🧠 How the Converter Works

1. **Singlish → Unicode** — A phonetic rule engine parses the romanised input using sorted key tables (longest match first) and produces standard Sinhala Unicode, including correct ZWJ insertion for Rakaransaya (ර්‍) and Yansaya (ය්‍) ligatures.

2. **Unicode → Legacy** — A comprehensive character map converts each Unicode Sinhala cluster to its FM Abhaya ASCII encoding. ASCII punctuation (`.`, `,`, `!`, etc.) is shielded from the font's glyph remapping using Unicode PUA slots, then restored for clipboard copying — so periods look like periods, not `ග`.

---

## 📄 License

MIT © [Desh](https://github.com/desh2001)
