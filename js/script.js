document.addEventListener('DOMContentLoaded', () => {
    // --- Security Helpers ---
    /**
     * Better XSS Prevention
     * Uses a more robust approach to sanitize HTML strings
     */
    window.escapeHTML = (str) => {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };

    /**
     * Obfuscated API Configuration
     * Prevents simple scrapers from finding the endpoint
     */
    const _config = {
        _p1: 'https://script.google.com/macros/s/',
        _p2: 'AKfycbwIIKpsHGvqa3f3RxWcB9_OAYEpgIkx8jbnq63X5cOneof-7kos0nzUR5iOonsYirYHIw',
        _p3: '/exec',
        getEndpoint: function () {
            return this._p1 + this._p2 + this._p3;
        }
    };

    // --- Component Injection ---
    const injectComponents = () => {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');
        const cartPlaceholder = document.getElementById('cart-placeholder');
        const contactPlaceholder = document.getElementById('contact-modal-placeholder');

        // Note: Using innerHTML here for templates is safe as long as templates are static (from components.js)
        if (headerPlaceholder) headerPlaceholder.innerHTML = headerTemplate;
        if (footerPlaceholder) footerPlaceholder.innerHTML = footerTemplate;
        if (cartPlaceholder) cartPlaceholder.innerHTML = cartTemplate;
        if (contactPlaceholder) contactPlaceholder.innerHTML = contactModalTemplate;
    };

    injectComponents();

    // --- Share Logic ---
    const setupShare = () => {
        const shareBtn = document.getElementById('footer-share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                const shareData = {
                    title: 'NordicRoll - Premium Receipt Rolls',
                    text: 'Check out NordicRoll for premium BPA-free receipt rolls!',
                    url: window.location.href
                };

                if (navigator.share) {
                    try {
                        await navigator.share(shareData);
                    } catch (err) {
                        console.error('Error sharing:', err);
                    }
                } else {
                    // Fallback: Copy to clipboard
                    try {
                        await navigator.clipboard.writeText(window.location.href);
                        const currentLang = localStorage.getItem('preferredLang') || 'en';
                        const originalContent = shareBtn.innerHTML;
                        shareBtn.innerHTML = '✓';
                        setTimeout(() => {
                            shareBtn.innerHTML = originalContent;
                        }, 2000);
                    } catch (err) {
                        console.error('Could not copy text: ', err);
                    }
                }
            });
        }
    };

    setupShare();

    // --- Modal Logic ---
    const contactModal = document.getElementById('contact-modal');
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = document.getElementById('modal-overlay');
    const leadForm = document.getElementById('lead-form');

    const toggleModal = () => {
        if (contactModal) {
            contactModal.classList.toggle('active');
            document.body.style.overflow = contactModal.classList.contains('active') ? 'hidden' : '';
        }
    };

    if (modalClose) modalClose.addEventListener('click', toggleModal);
    if (modalOverlay) modalOverlay.addEventListener('click', toggleModal);

    // Replace mailto or generic contact links with modal trigger
    document.querySelectorAll('a[href^="mailto:"], [data-i18n="nav_contact"], [data-i18n="contact_sales_btn"], [data-i18n="get_quote"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleModal();
        });
    });

    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Honeypot check
            const honeypot = leadForm.querySelector('input[name="bot_field"]');
            if (honeypot && honeypot.value !== '') {
                console.warn("Bot detected via honeypot.");
                return;
            }

            const submitBtn = leadForm.querySelector('.modal-submit-btn');
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;

            const formData = new FormData(leadForm);
            formData.append('Status', 'New');
            formData.append('FormSource', 'ContactModal');

            const API_URL = _config.getEndpoint();

            try {
                // Security: Added timeout and basic validation
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(API_URL, {
                    method: 'POST',
                    body: formData,
                    mode: 'no-cors',
                    signal: controller.signal,
                    headers: { 'Accept': 'application/json' }
                });

                clearTimeout(timeoutId);

                // Since we use no-cors with Google Script, response.ok will be false but submission often succeeds
                const formContainer = leadForm.parentElement;
                const successMsg = document.getElementById('modal-success-msg');
                if (successMsg) {
                    leadForm.style.display = 'none';
                    successMsg.style.display = 'block';

                    const closeSuccess = document.getElementById('success-close');
                    if (closeSuccess) {
                        closeSuccess.addEventListener('click', () => {
                            toggleModal();
                            setTimeout(() => {
                                leadForm.style.display = 'block';
                                successMsg.style.display = 'none';
                                leadForm.reset();
                            }, 500);
                        }, { once: true });
                    }
                }
            } catch (err) {
                console.error('Security/Network error:', err);
                alert('Connection error. Please try again later.');
            } finally {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // --- Entry Animations ---
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply animation to all relevant elements at once
    const animatedElements = document.querySelectorAll('.feature-card, .product-card, .subscription-card, .testimonial-card, .faq-item, .value-card, .stats-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)';
        observer.observe(el);
    });
    // --- Mobile Menu Toggle ---
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        const isExpanded = mobileMenuToggle.classList.contains('active');
        mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // --- Multi-language Support ---
    // translations object is now loaded from translations.js

    const langFlags = {
        en: "🇺🇸",
        sv: "🇸🇪",
        fa: "🇮🇷",
        de: "🇩🇪",
        ar: "🇸🇦",
        tr: "🇹🇷"
    };

    const changeLanguage = (lang) => {
        document.querySelectorAll('[data-i18n], [data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const ariaKey = el.getAttribute('data-i18n-aria');

            if (key && translations[lang] && translations[lang][key]) {
                const translation = translations[lang][key];
                // Use innerHTML if the translation contains HTML tags (like <a>)
                if (translation.includes('<') && translation.includes('>')) {
                    el.innerHTML = translation;
                } else {
                    el.textContent = translation;
                }
            }

            if (ariaKey && translations[lang] && translations[lang][ariaKey]) {
                el.setAttribute('aria-label', translations[lang][ariaKey]);
            }
        });

        // Toggle RTL for Farsi
        if (lang === 'fa') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', 'fa');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', lang);
        }

        // Update switcher UI
        const currentFlag = document.getElementById('current-lang-flag');
        const currentName = document.getElementById('current-lang-name');
        if (currentFlag) currentFlag.textContent = langFlags[lang];
        if (currentName) currentName.textContent = lang.toUpperCase();

        // Save preference
        localStorage.setItem('preferredLang', lang);

        // Update cart items text after language change
        if (typeof updateCartUI === 'function') updateCartUI();
        if (typeof updateCheckoutSummary === 'function') updateCheckoutSummary();

        // Dispatch a custom event so other components (like bulk calculator) know language changed
        window.dispatchEvent(new Event('languageChanged'));
    };

    // --- Global Checkout Summary Logic ---
    window.updateCheckoutSummary = () => {
        const itemsContainer = document.getElementById('checkout-items');
        const totalAmountEl = document.getElementById('checkout-total');
        if (!itemsContainer) return; // Not on checkout page

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const currentLang = localStorage.getItem('preferredLang') || 'en';

        itemsContainer.innerHTML = '';
        let itemsTotal = 0;

        if (cart.length === 0) {
            const emptyMsg = (translations[currentLang] && translations[currentLang].cart_empty) ? translations[currentLang].cart_empty : "Your cart is empty";
            itemsContainer.innerHTML = `<p style="text-align:center; color:var(--text-light); padding: 1rem 0;">${emptyMsg}</p>`;
        } else {
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                itemsTotal += itemTotal;

                const itemEl = document.createElement('div');
                itemEl.className = 'summary-item';
                itemEl.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:1rem 0; border-bottom:1px solid var(--bg-alt);';

                // Dynamic translated name
                const baseName = (translations && translations[currentLang] && item.key) ?
                    (translations[currentLang][item.key + '_title'] || item.name) : item.name;
                const unitLabel = (translations && translations[currentLang] && item.unit) ?
                    translations[currentLang][item.unit] : '';
                const displayName = unitLabel ? `${baseName} (${unitLabel})` : baseName;

                itemEl.innerHTML = `
                    <div class="item-info" style="display:flex; flex-direction:column; gap:0.25rem;">
                        <strong style="font-size:0.95rem; color:var(--text-color);">${escapeHTML(displayName.split('ⓘ')[0].trim())}</strong>
                        <span style="font-size:0.85rem; color:var(--text-light);">x${item.quantity}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.8rem;">
                        <div class="item-price" style="font-weight:600; color:var(--text-color);">${itemTotal} kr</div>
                        <button class="remove-summary-item" data-index="${index}" style="background:none; border:none; cursor:pointer; color:#ef4444; padding:5px; display:flex; align-items:center; justify-content:center; border-radius:50%;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                `;
                itemsContainer.appendChild(itemEl);
            });
        }

        // Shipping Calculation
        const FREE_SHIPPING_THRESHOLD = 300;
        const STANDARD_SHIPPING = 49;

        // Aligned with updateCartUI: Free at 300 or above
        let shippingCost = (itemsTotal > 0 && itemsTotal < FREE_SHIPPING_THRESHOLD) ? STANDARD_SHIPPING : 0;

        const shippingLine = document.querySelector('.summary-line:not(.total)');
        if (shippingLine) {
            const labelSpan = shippingLine.querySelector('span:first-child');
            const priceSpan = shippingLine.querySelector('span:nth-child(2)');

            if (labelSpan && priceSpan) {
                if (shippingCost === 0 && itemsTotal > 0) {
                    // It's Free Shipping
                    labelSpan.setAttribute('data-i18n', 'shipping_free');
                    labelSpan.textContent = (translations[currentLang] && translations[currentLang].shipping_free) ? translations[currentLang].shipping_free : "Free Shipping";

                    priceSpan.textContent = `${STANDARD_SHIPPING} kr`;
                    priceSpan.style.textDecoration = 'line-through';
                    priceSpan.style.color = 'var(--text-light)';
                } else {
                    // Normal Shipping Cost applies
                    labelSpan.setAttribute('data-i18n', 'shipping_cost');
                    labelSpan.textContent = (translations[currentLang] && translations[currentLang].shipping_cost) ? translations[currentLang].shipping_cost : "Shipping";

                    priceSpan.textContent = `${shippingCost} kr`;
                    priceSpan.style.textDecoration = 'none';
                    priceSpan.style.color = shippingCost === 0 ? '#059669' : 'var(--text-color)';
                }
            }
        }

        if (totalAmountEl) totalAmountEl.textContent = `${itemsTotal + shippingCost} kr`;
    };

    window.removeCheckoutItem = (index) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (index >= 0 && index < cart.length) {
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            window.updateCheckoutSummary();
            if (typeof window.updateCartUI === 'function') window.updateCartUI();
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        }
    };

    // Make global
    window.changeLanguage = changeLanguage;

    // Event listeners for language dropdown
    document.querySelectorAll('.lang-dropdown a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = link.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });

    // --- Theme Toggle Support ---
    const themeToggle = document.getElementById('theme-toggle');
    const modeIcon = themeToggle ? themeToggle.querySelector('.mode-icon') : null;

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (modeIcon) modeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    };

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    // Initialize theme from local storage or system preference
    const savedTheme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);



    // --- Shopping Cart Logic ---
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Restore these variables so event listeners below can use them.
    // They are available because injectComponents() has already run.
    const cartToggle = document.getElementById('cart-toggle');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const cartCountBadge = document.getElementById('cart-count');

    // We will query these inside the function to ensure we always have the latest DOM elements
    // in case of re-renders or injection timing issues.

    const updateCartUI = () => {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalAmount = document.getElementById('cart-total-amount');
        const cartCountBadge = document.getElementById('cart-count');

        let total = 0;
        let count = 0;

        const currentLang = localStorage.getItem('preferredLang') || 'en';

        // Recalculate totals
        if (cart) {
            cart.forEach(item => {
                total += item.price * item.quantity;
                count += item.quantity;
            });
        }

        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            // Safety check for translations
            const emptyText = (translations && translations[currentLang] && translations[currentLang].cart_empty)
                ? translations[currentLang].cart_empty
                : 'Your cart is empty';

            if (!cart || cart.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="empty-cart-container">
                        <span class="empty-cart-icon">🛒</span>
                        <p class="empty-msg" data-i18n="cart_empty">${emptyText}</p>
                        <button class="btn btn-primary shop-now-btn" style="margin-top: 1.5rem;" data-i18n="shop_now">Shop Now</button>
                    </div>
                `;
            } else {
                cart.forEach((item, index) => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'cart-item';

                    // Dynamic translated name
                    const baseName = (translations && translations[currentLang] && item.key) ?
                        (translations[currentLang][item.key + '_title'] || item.name) : item.name;
                    const unitLabel = (translations && translations[currentLang] && item.unit) ?
                        translations[currentLang][item.unit] : '';

                    const displayName = unitLabel ? `${baseName} (${unitLabel})` : baseName;

                    itemElement.innerHTML = `
                        <img src="${escapeHTML(item.image)}" alt="${escapeHTML(displayName)}">
                        <div class="cart-item-info">
                            <h4>${escapeHTML(displayName.split('ⓘ')[0].trim())}</h4>
                            <p>${escapeHTML((item.price * item.quantity).toString())} kr</p>
                            <div class="quantity-selector">
                                <button class="qty-btn cart-minus" data-index="${index}" aria-label="Decrease quantity">-</button>
                                <input type="text" class="qty-input" value="${escapeHTML(item.quantity.toString())}" readonly>
                                <button class="qty-btn cart-plus" data-index="${index}" aria-label="Increase quantity">+</button>
                            </div>
                            <button class="remove-btn" data-index="${index}" aria-label="Remove item">
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        </div>
                    `;
                    cartItemsContainer.appendChild(itemElement);
                });
            }
        }

        if (cartTotalAmount) cartTotalAmount.textContent = `${total} kr`;
        if (cartCountBadge) cartCountBadge.textContent = count;

        // Shipping Msg & Progress Logic
        const shippingMsgEl = document.getElementById('cart-shipping-msg');
        const progressBar = document.getElementById('shipping-progress-bar');
        const FREE_SHIPPING_THRESHOLD = 300;

        if (shippingMsgEl && progressBar) {
            const progress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
            progressBar.style.setProperty('--progress', `${progress}%`);

            if (total >= FREE_SHIPPING_THRESHOLD) {
                shippingMsgEl.textContent = (translations && translations[currentLang] && translations[currentLang].free_shipping_qualified)
                    ? translations[currentLang].free_shipping_qualified
                    : "Free Shipping! 🎉";
                shippingMsgEl.style.color = "#059669"; // Emerald Green
                shippingMsgEl.style.fontWeight = "bold";
                progressBar.style.background = "rgba(5, 150, 105, 0.2)";
                progressBar.style.boxShadow = "0 0 15px rgba(5, 150, 105, 0.2)";
            } else {
                const remaining = FREE_SHIPPING_THRESHOLD - total;
                let msg = (translations && translations[currentLang] && translations[currentLang].spend_more)
                    ? translations[currentLang].spend_more
                    : "Spend {amount} kr more for free shipping";
                msg = msg.replace('{amount}', remaining);
                shippingMsgEl.textContent = msg;
                shippingMsgEl.style.color = "var(--text-light)";
                shippingMsgEl.style.fontWeight = "normal";
                progressBar.style.background = "var(--bg-alt)";
                progressBar.style.boxShadow = "none";
            }
        }

        // Disable/Enable Checkout Button based on cart status
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            if (!cart || cart.length === 0) {
                checkoutBtn.style.pointerEvents = 'none';
                checkoutBtn.style.opacity = '0.5';
                checkoutBtn.style.cursor = 'not-allowed';
                checkoutBtn.setAttribute('aria-disabled', 'true');
            } else {
                checkoutBtn.style.pointerEvents = 'auto';
                checkoutBtn.style.opacity = '1';
                checkoutBtn.style.cursor = 'pointer';
                checkoutBtn.removeAttribute('aria-disabled');
            }
        }


        // We do NOT need to save to localStorage here if we are just updating UI from an existing state.
        // But the original code did. If this is called after external modification, saving back unchanged data is harmless but redundant.
        // However, if called from internal actions (addToCart), we need to save.
        // Let's keep it for safety but verify we don't overwrite with stale data.
        // Since we reload 'cart' before calling this in window.updateCartUI, it is safe.
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    // Make global so inventory loader and other scripts can use it
    window.applyTranslations = (lang) => {
        changeLanguage(lang);
    };

    window.updateCartUI = () => {
        try {
            cart = JSON.parse(localStorage.getItem('cart')) || [];
            updateCartUI();
        } catch (e) {
            console.error('Error updating cart UI:', e);
        }
    };

    window.addEventListener('cartUpdated', () => {
        window.updateCartUI();
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') {
            window.updateCartUI();
        }
    });

    const addToCart = (product, quantity) => {
        // Find existing item by a unique key (id + unit)
        const itemKey = `${product.key || product.name}-${product.unit || 'box'}`;
        const existingItem = cart.find(item => `${item.key || item.name}-${item.unit || 'box'}` === itemKey);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity: quantity });
        }
        updateCartUI();
        window.dispatchEvent(new CustomEvent('cartUpdated'));

        // Bounce animation
        const cartToggle = document.getElementById('cart-toggle');
        if (cartToggle) {
            cartToggle.classList.add('cart-bounce');
            setTimeout(() => cartToggle.classList.remove('cart-bounce'), 500);
        }
    };

    // Event Delegation for cart drawer and summary items
    document.addEventListener('click', (e) => {
        const target = e.target;

        // Cart Items Delegation
        const cartContainer = document.getElementById('cart-items');
        if (cartContainer && cartContainer.contains(target)) {
            const removeBtn = target.closest('.remove-btn');
            const plusBtn = target.closest('.cart-plus');
            const minusBtn = target.closest('.cart-minus');

            if (removeBtn) {
                const index = removeBtn.getAttribute('data-index');
                cart.splice(index, 1);
                updateCartUI();
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            } else if (plusBtn) {
                const index = plusBtn.getAttribute('data-index');
                cart[index].quantity += 1;
                updateCartUI();
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            } else if (minusBtn) {
                const index = minusBtn.getAttribute('data-index');
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
                updateCartUI();
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            }
        }

        // Checkout Summary Delegation
        const summaryContainer = document.getElementById('checkout-items');
        if (summaryContainer && summaryContainer.contains(target)) {
            const removeBtn = target.closest('.remove-summary-item');
            if (removeBtn) {
                const index = parseInt(removeBtn.getAttribute('data-index'));
                removeCheckoutItem(index);
            }
        }

        // Shop Now Button Delegation
        if (target.closest('.shop-now-btn')) {
            window.toggleCart(true);
        }
    });

    // --- Dynamic Product Event Delegation ---
    document.addEventListener('click', (e) => {
        const target = e.target;

        // 1. Quantity Selector Logic
        const qtyBtn = target.closest('.qty-btn');
        if (qtyBtn) {
            const card = qtyBtn.closest('.product-card');
            const qtyInput = card.querySelector('.qty-input');
            if (qtyInput) {
                let val = parseInt(qtyInput.value);
                if (qtyBtn.classList.contains('minus')) {
                    if (val > 1) qtyInput.value = val - 1;
                } else {
                    qtyInput.value = val + 1;
                }
            }
        }

        // 2. Unit Selector Logic
        const unitOption = target.closest('.unit-option');
        if (unitOption) {
            const card = unitOption.closest('.product-card');
            const options = card.querySelectorAll('.unit-option');
            const priceEl = card.querySelector('.price span');

            options.forEach(opt => opt.classList.remove('active'));
            unitOption.classList.add('active');

            const unit = unitOption.dataset.unit;
            const price = unit === 'box' ? card.dataset.boxPrice : card.dataset.rollPrice;
            if (priceEl) priceEl.textContent = price;
        }

        // 3. Add To Cart Button Logic
        const addToCartBtn = target.closest('.btn-secondary[data-i18n="add_to_cart"]');
        if (addToCartBtn) {
            const card = addToCartBtn.closest('.product-card');
            if (!card) return; // Not a standard product card (could be bulk)

            // Visual feedback Logic
            if (addToCartBtn.classList.contains('btn-added')) return;

            const qtyInput = card.querySelector('.qty-input');
            const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
            const activeUnit = card.querySelector('.unit-option.active');
            const unitType = activeUnit ? activeUnit.dataset.unit : 'box';

            const product = {
                key: card.dataset.productKey,
                name: card.querySelector('h3').textContent.split('ⓘ')[0].trim(),
                price: parseInt(card.querySelector('.price span').textContent) || 0,
                image: card.querySelector('img').getAttribute('src'),
                unit: unitType
            };

            addToCart(product, quantity);

            const currentLang = localStorage.getItem('preferredLang') || 'en';
            const addedText = (translations[currentLang] && translations[currentLang].item_added)
                ? translations[currentLang].item_added : "Added!";
            const originalText = (translations[currentLang] && translations[currentLang].add_to_cart)
                ? translations[currentLang].add_to_cart : "Add to Cart";

            addToCartBtn.classList.add('btn-added');
            addToCartBtn.textContent = addedText;

            setTimeout(() => {
                addToCartBtn.classList.remove('btn-added');
                addToCartBtn.textContent = originalText;
            }, 2000);

            if (qtyInput) qtyInput.value = 1;
        }
    });

    // Toggle Cart (Global access for injected HTML)
    window.toggleCart = (shouldScroll = false) => {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.toggle('active');
            cartOverlay.classList.toggle('active');
            // Close mobile menu if open
            if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
            if (navLinks) navLinks.classList.remove('active');

            // If requested, scroll to products
            if (shouldScroll) {
                const productsSection = document.getElementById('products');
                if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                } else if (window.location.pathname.indexOf('index.html') === -1) {
                    window.location.href = 'index.html#products';
                }
            }
        }
    };

    if (cartToggle) cartToggle.addEventListener('click', () => window.toggleCart());
    if (cartClose) cartClose.addEventListener('click', () => window.toggleCart());
    if (cartOverlay) cartOverlay.addEventListener('click', () => window.toggleCart());

    // Initialize from local storage or default to EN
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    window.applyTranslations(savedLang);
});
