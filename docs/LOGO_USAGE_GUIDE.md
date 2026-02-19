# 🎨 NordicRoll Logo Usage Guide

## 📁 Created Files:

### 1️⃣ `logo.svg` - Main Logo
- **Usage:** Website header, emails, documents
- **Color:** Blue on white/light background
- **Dimensions:** 200x60 pixels

### 2️⃣ `logo-white.svg` - White Logo
- **Usage:** Footer, dark backgrounds
- **Color:** White on dark background
- **Dimensions:** 200x60 pixels

### 3️⃣ `logo-icon.svg` - Square Icon
- **Usage:** Favicon, social media, apps
- **Color:** Blue with white letters
- **Dimensions:** 64x64 pixels

---

## 🔧 How to Use on the Website:

### In Header (Replacing current logo):

```html
<!-- In components.js or header -->
<a href="index.html" class="logo">
    <img src="logo.svg" alt="NordicRoll" height="40">
</a>
```

### In Footer (White version):

```html
<a href="index.html" class="logo">
    <img src="logo-white.svg" alt="NordicRoll" height="40">
</a>
```

### As Favicon:

```html
<!-- In <head> of all HTML pages -->
<link rel="icon" type="image/svg+xml" href="logo-icon.svg">
<link rel="apple-touch-icon" href="logo-icon.svg">
```

---

## 🎨 Suggested CSS Settings:

```css
/* For logo in header */
.logo img {
    height: 40px;
    width: auto;
    transition: transform 0.3s ease;
}

.logo img:hover {
    transform: scale(1.05);
}

/* For mobile */
@media (max-width: 768px) {
    .logo img {
        height: 32px;
    }
}
```

---

## 📱 Use in Social Media:

### Open Graph (Facebook, LinkedIn):
```html
<meta property="og:image" content="https://nordicroll.com/logo-icon.svg">
```

### Twitter Card:
```html
<meta name="twitter:image" content="https://nordicroll.com/logo-icon.svg">
```

---

## 🖨️ For Print:

### Convert to PNG (High Quality):

You can use online tools:
- https://cloudconvert.com/svg-to-png
- https://svgtopng.com/

**Suggested Settings:**
- DPI: 300 (For print)
- Width: 2000px (For high quality)
- Background: Transparent

---

## 🎯 Various Applications:

| Usage | File | Suggested Size |
|---------|------|---------------|
| **Website Header** | logo.svg | 40-50px height |
| **Footer** | logo-white.svg | 40px height |
| **Favicon** | logo-icon.svg | 64x64px |
| **Business Card** | logo.svg → PNG | 300 DPI |
| **Invoice/Letterhead** | logo.svg → PNG | 150-200px width |
| **Social Media** | logo-icon.svg | 512x512px |
| **Email Signature** | logo.svg → PNG | 150px width |

---

## ✨ Logo Features:

✅ **Vector (SVG)** - Clear and sharp in any size  
✅ **Lightweight** - Small file size (less than 2KB)  
✅ **Responsive** - Works well on all devices  
✅ **Brand Colors** - Matching website (#3b82f6)  
✅ **Printable** - For monochrome and full color  

---

## 🔄 Custom Changes:

### Change Color:
In the SVG file, replace `fill="#3b82f6"` with your desired color.

### Change Size:
Change the `width` and `height` attributes in the `<svg>` tag.

### Remove Tagline:
Remove the `<text>` line containing "PREMIUM RECEIPT ROLLS".

---

## 📞 Important Notes:

1. **Always use SVG** (not PNG) for web
2. **Don't copy files** - Use links
3. **Don't forget Alt text** for SEO
4. **Test** on different backgrounds

---

**Good luck! 🚀**
