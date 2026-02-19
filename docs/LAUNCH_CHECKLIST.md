# 🚀 NordicRoll Launch Checklist

This file contains all the points you need to follow to turn this template into a commercial and live website.

---

### 1. Connecting Forms to Management System (Backend)
Currently, forms only have a graphical appearance. To receive orders:
- [ ] Choose a form handling service (Recommendation: [Formspree](https://formspree.io/) or [Netlify Forms](https://www.netlify.com/products/forms/)).
- [ ] Change the script in `script.js` and `checkout.html` to send data to the Endpoint address.
- [ ] Test sending a sample order and receiving it in the management email.

### 2. Payment System (Payments)
- [ ] **Swish:** Obtain a commercial Swish number and place it on the Checkout page or connect to the official Swish API.
- [ ] **Bank Gateway:** If direct payment is needed, create an account on Stripe or Klarna and replace the simulated codes with the real API.

### 3. Final Content and Pricing
- [ ] Re-check all prices in the `translations.js` file (Products and Subscriptions sections).
- [ ] Final confirmation of roll lengths (e.g., 40M or 16M) with inventory.
- [ ] Check official contact number and email in the footer and contact page.

### 4. Legal Texts and GDPR (Sweden)
- [ ] Edit the `privacy.html` page with real company information (registered name, tax registration number).
- [ ] Ensure that the Terms of Service comply with business laws in Sweden.

### 5. Technical Settings and SEO
- [ ] **Favicon:** Design and place a small icon for the browser tab.
- [ ] **SEO:** Check Meta and Description tags on all pages (Index, Bulk, Checkout).
- [ ] **Speed:** Optimize image sizes (convert to WebP) for faster loading.

### 6. Hosting and Domain
- [ ] Purchase domain `nordicroll.se` or `nordicroll.com`.
- [ ] Choose suitable hosting (Netlify and Vercel are great and free/cheap for these types of sites).
- [ ] Set up SSL (HTTPS) security protocol, which is vital for customer trust and SEO.

### 7. Final Test (Quality Assurance)
- [ ] Full test of the "purchase cycle" from product selection to final confirmation on mobile.
- [ ] Check the correct display of fonts and text direction (RTL) in Persian.
- [ ] Ensure the "Change Language" button works correctly on all pages.

---
📅 **Date Created:** 2026-02-02
🚩 **Project Status:** Ready for gateway and hosting connection.
