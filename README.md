# Vance Health | Premium Practice Architecture & Agency Command Suite

> **Private & Confidential** — Built for high-ticket healthcare marketing, agency demonstration, and turn-key client deployment.

Vance Health is a high-converting, multi-page web application designed for private clinics, chiropractic centers, and physical therapy practices. Built with React, TypeScript, Tailwind CSS, and React Router, it combines an elite patient-facing experience with a real-time Agency Command Suite for sales demos.

---

## 🌟 Key Features

* **Multi-Page Patient Experience:** Dedicated routing for `/`, `/conditions`, `/first-visit`, `/about`, and `/contact`.
* **Live Agency Command Suite (`Cmd + Shift + C`):** Switch practice presets, tweak primary/accent color palettes with native color pickers, and edit copy live during prospect sales calls.
* **Granular Section Visibility:** Toggle trust bars, condition selectors, doctor profiles, patient stories, and pricing sections on/off instantly.
* **Dynamic Theme Engine:** Real-time CSS variable injection for brand colors and font pairings (Classic Editorial, Modern Avant-Garde, Serene Academic, Timeless Luxury).
* **High-Converting Booking Modals:** Built-in multi-step booking flows and sticky mobile response bars.

---

## 📂 Real Repo Structure

```text
├── src/
│   ├── assets/              # Static imagery and visual assets
│   ├── components/          # Reusable UI components & modals
│   │   ├── AgencyWorkspace.tsx
│   │   ├── BookingModal.tsx
│   │   ├── Navbar.tsx
│   │   └── ...
│   ├── data/                # Clinic presets, color palettes, and copy
│   ├── pages/               # Route pages
│   │   ├── Home.tsx
│   │   ├── Conditions.tsx
│   │   ├── FirstVisit.tsx
│   │   ├── About.tsx
│   │   └── Contact.tsx
│   ├── types.ts             # TypeScript interface definitions
│   ├── App.tsx              # Main application shell and route configuration
│   └── main.tsx             # Application entry point
├── .env.example             # Environment template
├── index.html               # Entry HTML shell
├── package.json             # Project dependencies and metadata
├── tailwind.config.js       # Tailwind styling configuration
└── vite.config.ts           # Vite bundler configuration
