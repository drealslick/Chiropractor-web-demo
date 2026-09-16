# Chiropractic Clinic & Healthcare Landing Page Template

A high-converting, modern, and accessible web application designed for chiropractic practices, sports rehab, and physical therapy clinics. Built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS**.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Node.js**: v18.0.0 or later (Node 20+ recommended)
- **npm**, **yarn**, **pnpm**, or **bun**

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000` (or the port shown in your terminal).

### 3. Production Build
```bash
npm run build
```
This outputs an optimized, static single-page application into the `dist/` directory, ready to deploy anywhere.

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🌐 1-Click Deployment

Because this is a standard Vite React SPA, it can be deployed with zero configuration on:

- **Vercel**: Import your GitHub repository, framework preset will auto-detect as `Vite`. Build command: `npm run build`, Output directory: `dist`.
- **Netlify**: Connect repository, build command: `npm run build`, publish directory: `dist`.
- **Cloudflare Pages**: Framework preset `Vite`, build command `npm run build`, output directory `dist`.
- **GitHub Pages**: Deploy the `dist` directory via GitHub Actions.

---

## ⚙️ Agency Manager & Customization

The site includes a hidden, client-safe **Agency Management Suite** to customize clinic name, doctor bio, pricing specials, phone numbers, addresses, and color palettes without editing code:

### Accessing the Manager
- **Keyboard Shortcut**: Press `Cmd + Shift + C` (Mac) or `Ctrl + Shift + C` (Windows).
- **URL Parameter**: Open the site with `?agency=true` or `?admin=true`.

> **Note**: Standard clinic visitors and prospective clients will **never** see the manager or admin controls.

### Features
- **Color Palettes**: 1-click toggle between *Restorative Green*, *Modern Minimal*, *Warm Earth*, and *Professional Blue*.
- **Live Form Editing**: Edit clinic name, doctor credentials, phone numbers, and promotional offers.
- **Export & Import**: Download client configurations as JSON files or load pre-made city templates (Austin, Denver, San Diego).

---

## 📁 Project Structure

```
├── public/                 # Static assets & icons
├── src/
│   ├── components/         # Modular React components (Hero, Navbar, BookingModal, etc.)
│   ├── data/
│   │   ├── clinicData.ts   # Default clinic details & FAQs
│   │   ├── colorPalettes.ts# Predefined Tailwind color themes
│   │   └── presets.ts      # Demo clinic presets
│   ├── types.ts            # TypeScript interfaces
│   ├── App.tsx             # Root application orchestrator
│   ├── index.css           # Tailwind CSS imports & dynamic theme variables
│   └── main.tsx            # Application entry point
├── index.html              # HTML shell with Google Fonts & SEO tags
├── package.json            # Scripts & dependencies
└── vite.config.ts          # Vite & Tailwind configuration
```

---

## 🛡️ License
Private and confidential. Built for agency demonstration and client deployment.
