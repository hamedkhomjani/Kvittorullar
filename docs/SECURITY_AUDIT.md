# Security & Quality Audit Report - NordicRoll

## 1. Security Analysis (Amniat)

### ✅ Positive Findings
*   **HTTPS Usage**: All external resources (fonts, APIs) correctly use HTTPS.
*   **XSS Prevention (Cross-Site Scripting)**:
    *   The `script.js` file implements a `window.escapeHTML` helper function.
    *   This function is correctly used when rendering user inputs (like product names in the cart) to the DOM (e.g., lines 407-409 in `script.js`).
    *   This prevents malicious scripts from being injected via product data or local storage manipulation.
*   **Spam Protection**:
    *   A hidden "honeypot" field (`bot_field`) is implemented in both the checkout and lead forms. This effectively blocks simple bots from submitting spam.
*   **Robots.txt**:
    *   The `robots.txt` file is correctly configured to allow indexing and points to the sitemap. It does not accidentally expose any sensitive admin paths.

### ⚠️ Areas for Improvement (Moderate Risk)
*   **Content Security Policy (CSP)**:
    *   The current CSP allows `unsafe-inline` for both scripts and styles.
    *   *Current*: `script-src 'self' 'unsafe-inline'`
    *   *Risk*: If an attacker can inject code, the browser will execute it because "inline" scripts are allowed.
    *   *Recommendation*: In a future "Review" phase, move all inline event handlers (like `onclick="..."`) to `script.js` using `addEventListener`, and then remove `'unsafe-inline'`. For now, it is acceptable for a static site.
*   **Exposed API Endpoints**:
    *   The Google Apps Script URL and Formspree URL are visible in the client-side code.
    *   *Risk*: A malicious user could spam these endpoints manually, bypassing the UI honeypot.
    *   *Mitigation*: Ensure your Google Script has quotas/rate limiting enabled on the server side (Google side).

## 2. Code Quality & Best Practices

*   **HTML Structure**: Semantic tags (`<header>`, `<main>`, `<footer>`, `<section>`) are used correctly, which is good for SEO and accessibility.
*   **Performance**: Meta content descriptions and Open Graph tags are present, which ensures links look good when shared on social media.
*   **No "Tabnabbing" Vulnerability**: No unsafe `target="_blank"` links were found.

## 3. Conclusion
The website is **secure for its purpose** as a static e-commerce site. Since there is no database or user login system on this server, the attack surface is very small. The main risks (XSS and Spam) are reasonably mitigated.
