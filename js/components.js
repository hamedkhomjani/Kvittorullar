const headerTemplate = `
<nav class="nav container">
    <a href="index.html" class="logo">NordicRoll</a>
    <ul id="nav-links" class="nav-links">
        <li><a href="index.html#products" data-i18n="nav_products">Products</a></li>
        <li><a href="subscription.html" data-i18n="nav_subscriptions">Subscriptions</a></li>
        <li><a href="index.html#features" data-i18n="nav_features">Features</a></li>
        <li><a href="about.html" data-i18n="nav_about">About Us</a></li>
        <li><a href="bulk.html" data-i18n="nav_bulk">Bulk Orders</a></li>
        <li><a href="index.html#contact" data-i18n="nav_contact">Contact</a></li>
    </ul>
    <div class="nav-controls">
        <div class="lang-switcher">
            <button class="lang-btn">
                <span id="current-lang-flag">🇺🇸</span>
                <span id="current-lang-name">EN</span>
            </button>
            <div class="lang-dropdown">
                <a href="#" data-lang="en">🇺🇸 English</a>
                <a href="#" data-lang="sv">🇸🇪 Svenska</a>
                <a href="#" data-lang="fa">🇮🇷 فارسی</a>
                <a href="#" data-lang="de">🇩🇪 Deutsch</a>
                <a href="#" data-lang="ar">🇸🇦 العربية</a>
                <a href="#" data-lang="tr">🇹🇷 Türkçe</a>
            </div>
        </div>
        <button id="cart-toggle" class="nav-btn" aria-label="Open cart">
            <span class="mode-icon">🛒</span>
            <span id="cart-count" class="badge">0</span>
            <span class="sr-only" data-i18n="cart_title">Shopping Cart</span>
        </button>
        <button id="theme-toggle" class="theme-toggle" aria-label="Toggle dark mode">
            <span class="mode-icon">🌙</span>
        </button>
        <button class="mobile-menu-toggle" aria-label="Toggle menu" aria-controls="nav-links" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>
</nav>`;

const footerTemplate = `
<div class="container footer-grid">
    <div class="footer-col">
        <a href="index.html" class="logo">NordicRoll</a>
        <p class="footer-about" data-i18n="footer_about">Sweden's leading supplier of high-quality thermal receipt rolls for modern businesses.</p>
        <div class="footer-social">
            <h4 data-i18n="footer_social">Follow Us</h4>
            <div class="social-icons">
                <a href="#" class="social-icon" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="#" class="social-icon" aria-label="Facebook">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" class="social-icon" aria-label="LinkedIn">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <button class="social-icon share-btn" data-i18n-aria="footer_share" id="footer-share-btn">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                </button>
            </div>
        </div>
    </div>
    <div class="footer-col">
        <h4 data-i18n="footer_links">Quick Links</h4>
        <ul>
            <li><a href="index.html#products" data-i18n="nav_products">Products</a></li>
            <li><a href="index.html#subscriptions" data-i18n="nav_subscriptions">Subscriptions</a></li>
            <li><a href="bulk.html" data-i18n="nav_bulk">Bulk Orders</a></li>
            <li><a href="index.html#faq" data-i18n="nav_faq">FAQ</a></li>
        </ul>
    </div>
    <div class="footer-col">
        <h4 data-i18n="footer_contact">Contact</h4>
        <ul>
            <li>sales@nordicroll.com</li>
            <li>Stockholm, Sweden</li>
        </ul>
    </div>
    <div class="footer-col">
        <h4 data-i18n="footer_legal">Legal</h4>
        <ul>
            <li><a href="privacy.html" data-i18n="footer_privacy">Privacy Policy</a></li>
            <li data-i18n="footer_terms">Terms of Service</li>
        </ul>
    </div>
</div>
<div class="container footer-bottom">
    <p>&copy; 2024 NordicRoll. <span data-i18n="all_rights">All rights reserved.</span></p>
</div>`;

const cartTemplate = `
<div id="cart-drawer" class="cart-drawer">
    <div class="cart-header">
        <h2 data-i18n="cart_title">Shopping Cart</h2>
        <button id="cart-close" class="close-btn">&times;</button>
    </div>
    
    <!-- Free Shipping Progress -->
    <div class="shipping-progress-container">
        <div id="shipping-progress-bar" class="shipping-progress-bar"></div>
        <div id="cart-shipping-msg" class="cart-shipping-msg"></div>
    </div>

    <div id="cart-items" class="cart-items">
        <!-- Items will be injected by JS -->
    </div>
    <div class="cart-footer">
        <div class="cart-total">
            <span data-i18n="cart_total">Total</span>
            <span id="cart-total-amount">0 kr</span>
        </div>
        <a href="checkout.html" id="checkout-btn" class="btn btn-primary w-full" style="text-decoration: none; text-align: center;" data-i18n="checkout">Checkout</a>
    </div>
</div>
<div id="cart-overlay" class="cart-overlay"></div>`;

const contactModalTemplate = `
<div id="contact-modal" class="modal">
    <div class="modal-content">
        <button id="modal-close" class="modal-close">&times;</button>
        <div class="modal-body">
            <div class="modal-info">
                <div class="modal-badge-line"></div>
                <h2 data-i18n="contact_modal_title">Get more information about our products</h2>
                <div class="modal-desc">
                    <p data-i18n="contact_modal_subtitle">Want more information or have questions? Fill in the form and we will call you as soon as we can.</p>
                    <p><span data-i18n="contact_modal_phone">You are also warmly welcome to call us directly at</span> <strong>010-722 02 90</strong></p>
                </div>
            </div>
            <div class="modal-form-container">
                <form id="lead-form" class="modal-form">
                    <!-- Security: Honeypot field for bot protection -->
                    <input type="text" name="bot_field" style="display:none !important" tabindex="-1" autocomplete="off">
                    <div class="form-group">
                        <label for="contact-name" data-i18n="contact_name">Full Name</label>
                        <input type="text" id="contact-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-phone" data-i18n="contact_phone">Phone Number</label>
                        <input type="tel" id="contact-phone" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-email" data-i18n="contact_email">Email</label>
                        <input type="email" id="contact-email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-company" data-i18n="contact_company">Company</label>
                        <input type="text" id="contact-company" name="company">
                    </div>
                    <div class="form-group">
                        <label for="contact-message" data-i18n="contact_message">Describe your need</label>
                        <textarea id="contact-message" name="message" rows="3"></textarea>
                    </div>
                    <div class="form-group checkbox-group">
                        <input type="checkbox" id="terms" name="terms_accepted" required>
                        <label for="terms" data-i18n="contact_terms">I accept the terms</label>
                    </div>
                    <p class="policy-text" data-i18n="contact_policy">By clicking you agree to our privacy policy</p>
                    <button type="submit" class="modal-submit-btn" data-i18n="contact_send">Send!</button>
                </form>
                <div id="modal-success-msg" class="modal-success" style="display: none; text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                    <h3 data-i18n="contact_success_title">Tack!</h3>
                    <p data-i18n="contact_success_desc">Vi ringer dig snart.</p>
                    <button id="success-close" class="btn btn-primary" style="margin-top: 1.5rem;" data-i18n="close">Stäng</button>
                </div>
            </div>
        </div>
    </div>
    <div id="modal-overlay" class="modal-overlay"></div>
</div>

<div id="order-success-modal" class="modal">
    <div id="success-overlay" class="modal-overlay" style="opacity: 1; visibility: visible;"></div>
    <div class="modal-content" style="text-align: center; padding: 4rem 2rem; background: var(--card-bg); border-radius: 2rem; position: relative; z-index: 3001; max-width: 400px; width: 90%;">
        <div style="font-size: 5rem; margin-bottom: 1.5rem;">🎉</div>
        <h2 data-i18n="order_success">Order Successful!</h2>
        <p data-i18n="order_success_desc" style="color: var(--text-light); margin-bottom: 1.5rem;">Thank you for your business. We've received your request.</p>
        
        <div style="background: var(--bg-alt); padding: 1.5rem; border-radius: 1rem; margin-bottom: 2rem;">
            <p style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 0.5rem;" data-i18n="order_number">Order Number</p>
            <strong id="order-number-display" style="font-size: 1.5rem; color: var(--primary-color);">NR-XXXXX</strong>
        </div>

        <button id="success-done" class="btn btn-primary" style="width: 100%;" data-i18n="finalize_btn">Finish</button>
    </div>
</div>
`;
