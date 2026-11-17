# 🧾 Bill Maker

A bakery bill / invoice generator built with React 18 + Vite.  
Supports two layouts (Modern & Receipt), three color themes, logo upload, signature pad, GST/discount, and one-click PNG download.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later (comes with Node)

---

## Install

```bash
# Clone the repo
git clone https://github.com/apguptaaa/Bill-Maker.git
cd Bill-Maker

# Install dependencies
npm install
```

---

## Run locally (development)

```bash
npm run dev
```

Opens at **http://localhost:5173** with hot-reload.

---

## Build for production

```bash
npm run build
```

Output goes to the `dist/` folder.

---

## Preview the production build

```bash
npm run preview
```

Serves `dist/` locally at **http://localhost:4173** so you can verify the build before deploying.

---

## Lint

```bash
npm run lint
```

---

## Deploy

### Option 1 — GitHub Pages (using gh-pages)

```bash
npm install --save-dev gh-pages
```

Add these two lines to the `"scripts"` section of `package.json`:

```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

Also add `base` to `vite.config.js`:

```js
export default defineConfig({
  base: '/Bill-Maker/',
  plugins: [react()],
})
```

Then run:

```bash
npm run deploy
```

Your site will be live at `https://apguptaaa.github.io/Bill-Maker/`.

---

### Option 2 — Netlify (drag & drop)

1. Run `npm run build`
2. Go to [netlify.com](https://netlify.com) → **Add new site → Deploy manually**
3. Drag the `dist/` folder onto the page

---

### Option 3 — Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. Vercel auto-detects Vite and sets the output directory to `dist/`.

---

## Git setup (first time)

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/apguptaaa/Bill-Maker.git
git push -u origin main
```

After the first push, subsequent pushes are just:

```bash
git add .
git commit -m "your message"
git push
```

---

## Project structure

```
bill-maker/
├── index.html          # Minimal HTML shell
├── vite.config.js      # Vite config
├── package.json
├── src/
│   ├── main.jsx        # React entry point
│   ├── App.jsx         # Full app — components, logic, JSX
│   └── index.css       # All styles
└── dist/               # Production build output (git-ignored)
```

---

## Tech stack

| Tool | Purpose |
|------|---------|
| [React 18](https://react.dev) | UI |
| [Vite](https://vitejs.dev) | Dev server & bundler |
| [html2canvas](https://html2canvas.hertzen.com) | PNG export |
