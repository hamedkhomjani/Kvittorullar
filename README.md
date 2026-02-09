# NordicRoll - Premium Thermal Receipt Rolls

NordicRoll is a high-end, responsive web application designed for a premium supplier of thermal receipt paper rolls based in Sweden. The project showcases a modern UI/UX with professional features tailored for business clients.

## 🚀 Live Features

-   **Multi-language Support (i18n):** Full support for English, Swedish (Svenska), German (Deutsch), and Persian (Farsi) with automatic RTL (Right-to-Left) adjustment.
-   **Dark Mode:** Seamless theme switching with persistent user preference using LocalStorage.
-   **Modern Bento Grid:** A sophisticated "Features" section using CSS Grid for a clean, professional look.
-   **Interactive UI:** Smooth scrolling, intersection-based entrance animations, and a responsive mobile menu.
-   **Subscription System:** Clear and attractive pricing tables for monthly refill plans and enterprise solutions.
-   **Premium Aesthetics:** Custom glassmorphism effects, studio-quality product imagery (manually generated), and smooth transitions.
-   **About Us Page:** A dedicated story page with mission statements and core values.

## 🛠️ Technology Stack

-   **Frontend:** Vanilla HTML5, Semantic Structure.
-   **Styling:** Modern CSS3 with Custom Variables (CSS Variables) for easy theme management.
-   **Logic:** Pure Vanilla JavaScript (No heavy frameworks required for maximum performance).
-   **Animations:** Intersection Observer API for scroll-triggered effects and CSS Transitions.
-   **Typography:** Google Fonts (Inter).

## 📁 Project Structure

```text
├── index.html          # Main landing page
├── about.html          # Company story & values page
├── style.css           # Global styles and design system
├── script.js           # Multi-language, theme, and animation logic
└── [assets]            # Product images and branding
```

## 🌐 Language & Localization

The project uses a custom-built JSON-based translation system within `script.js`. It handles:
-   Text content replacement via `data-i18n` attributes.
-   `dir="rtl"` and `lang` attribute toggling for Persian support.
-   Language-specific font adjustments (if needed).

## 🔧 Installation / How to Run

Since this project uses vanilla technologies, no builder or server setup is required:
1.  Clone the repository or download the files.
2.  Open `index.html` in any modern web browser.
3.  Enjoy the smooth experience!

## 📄 License

© 2024 NordicRoll. All rights reserved. Designed for professional business supply visibility.
