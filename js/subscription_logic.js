/**
 * NordicRoll - Subscription Page Logic
 * Handles plan configuration, pricing, frequency selection, and submission.
 */

const SUB_INVENTORY_URL = "https://script.google.com/macros/s/AKfycbyGoX_zpfGc8rG0G-Ik7Qm_rX0s8bQd4zefxg2h9IUSzXwcFNAdJazlp_mxqJNkc7cE/exec";

document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.getElementById('subscription-items-container');
    const freqCards = document.querySelectorAll('.freq-card');
    const subSubmitBtn = document.querySelector('#subscription-form button[type="submit"]');
    const minWarning = document.getElementById('min-limit-warning');

    // Summary Elements
    const summaryItemsList = document.getElementById('summary-items-list');
    const summaryFreq = document.getElementById('summary-freq');
    const summaryTotal = document.getElementById('summary-total');
    const savingsAmount = document.getElementById('savings-amount');

    let currentFreq = {
        discount: 15,
        label: '1 Month',
        months: 1
    };

    let itemRows = []; // Will be populated after fetch

    // --- Dynamic Loading Logic ---
    async function loadSubscriptionProducts() {
        if (!itemsContainer) return;

        try {
            const response = await fetch(SUB_INVENTORY_URL);
            const products = await response.json();

            if (products && products.length > 0) {
                renderSubscriptionRows(products);
            } else {
                itemsContainer.innerHTML = '<p class="text-center">No subscription products available.</p>';
            }
        } catch (e) {
            console.error("Failed to load subscription products:", e);
            itemsContainer.innerHTML = '<p class="error-msg">Error loading products. Please try refreshing.</p>';
        }
    }

    function renderSubscriptionRows(products) {
        itemsContainer.innerHTML = ''; // Clear loading state
        const lang = localStorage.getItem('preferredLang') || 'en';

        // Helper to get translated string
        const t = (key) => (translations[lang] && translations[lang][key]) ? translations[lang][key] : key;

        products.forEach(p => {
            const row = document.createElement('div');
            row.className = 'sub-item-row';
            row.dataset.id = p.key;
            // Subscription is box-only usually, so we use price_box
            row.dataset.basePrice = p.price_box;

            const name = p[`name_${lang}`] || p.name_en || p.name;
            const price = p.price_box;

            // Default quantity for first item could be 3, others 0, or all 0
            // Let's set 0 for all to be clean, or existing pattern. 
            // Previous code had 3 for first item. Let's stick to 0 for neutral start unless logic demands.
            // Actually, let's keep it simple: start at 0.

            row.innerHTML = `
                <div class="item-meta">
                    <strong>${name}</strong>
                    <small>${price} kr / ${t('box') || 'box'}</small>
                </div>
                <div class="item-controls">
                    <div class="quality-toggle" data-addon="20">
                        <button class="toggle-btn active" type="button" data-quality="standard">${t('std_short') || 'Std'}</button>
                        <button class="toggle-btn" type="button" data-quality="bpa-free">${t('eco_short') || 'Eco'}</button>
                    </div>
                    <div class="stepper">
                        <button class="step-btn minus" type="button">-</button>
                        <input type="number" class="step-input" value="0" min="0" max="50">
                        <button class="step-btn plus" type="button">+</button>
                    </div>
                </div>
            `;
            itemsContainer.appendChild(row);
        });

        // Re-initialize logic
        initializeRowListeners();
    }

    function initializeRowListeners() {
        itemRows = document.querySelectorAll('.sub-item-row');

        itemRows.forEach(row => {
            const minusBtn = row.querySelector('.minus');
            const plusBtn = row.querySelector('.plus');
            const input = row.querySelector('.step-input');

            if (minusBtn) {
                minusBtn.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevent form submit if inside form
                    const val = parseInt(input.value) || 0;
                    if (val > 0) {
                        input.value = val - 1;
                        updateSummary();
                    }
                });
            }

            if (plusBtn) {
                plusBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const val = parseInt(input.value) || 0;
                    input.value = val + 1;
                    updateSummary();
                });
            }

            if (input) {
                input.addEventListener('change', () => {
                    if (input.value < 0) input.value = 0;
                    updateSummary();
                });
            }

            const toggles = row.querySelectorAll('.toggle-btn');
            toggles.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggles.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    updateSummary();
                });
            });
        });

        // Initial summary update
        updateSummary();
    }

    // --- Existing Logic adapted ---

    function updateSummary() {
        let totalSubtotal = 0;
        let summaryHTML = '';

        if (!itemRows.length) return;

        itemRows.forEach(row => {
            const qtyInput = row.querySelector('.step-input');
            const qty = parseInt(qtyInput.value) || 0; // Handle NaN
            const basePrice = parseInt(row.dataset.basePrice);

            const activeToggle = row.querySelector('.toggle-btn.active');
            const quality = activeToggle.dataset.quality; // 'standard' or 'bpa-free'
            const addonBase = parseInt(row.querySelector('.quality-toggle').dataset.addon);
            const addon = quality === 'bpa-free' ? addonBase : 0;

            const pricePerBox = basePrice + addon;
            const itemTotal = pricePerBox * qty;

            if (qty > 0) {
                row.classList.add('active');
                totalSubtotal += itemTotal;

                const name = row.querySelector('strong').textContent;
                const currentLang = localStorage.getItem('preferredLang') || 'en';
                const qualityLabel = quality === 'standard' ?
                    ((translations[currentLang] && translations[currentLang].std_short) || 'Std') :
                    ((translations[currentLang] && translations[currentLang].eco_short) || 'Eco');

                summaryHTML += `
                    <div class="summary-row" style="margin-bottom: 0.3rem;">
                        <span style="font-size: 0.9rem;">${qty}x ${window.escapeHTML(name)} (${qualityLabel})</span>
                        <strong style="font-size: 0.9rem;">${itemTotal.toLocaleString()} kr</strong>
                    </div>
                `;
            } else {
                row.classList.remove('active');
            }
        });

        const discountAmount = totalSubtotal * (currentFreq.discount / 100);
        const finalTotal = totalSubtotal - discountAmount;
        const monthlyAverage = finalTotal / currentFreq.months;

        if (summaryItemsList) summaryItemsList.innerHTML = summaryHTML || '<p style="color:var(--text-light); font-size:0.9rem;">No items selected</p>';
        if (summaryFreq) summaryFreq.textContent = currentFreq.label;
        if (summaryTotal) summaryTotal.textContent = `${Math.round(finalTotal).toLocaleString()} kr`;
        if (savingsAmount) savingsAmount.textContent = currentFreq.discount;

        // Minimum Price Check
        if (subSubmitBtn) {
            // Logic: Must spend at least 500kr/month on average
            if (monthlyAverage < 500 && totalSubtotal > 0) {
                subSubmitBtn.disabled = true;
                subSubmitBtn.style.opacity = '0.5';
                subSubmitBtn.style.cursor = 'not-allowed';
                if (minWarning) minWarning.style.display = 'block';
            } else if (totalSubtotal === 0) {
                subSubmitBtn.disabled = true;
                subSubmitBtn.style.opacity = '0.5';
                if (minWarning) minWarning.style.display = 'none';
            } else {
                subSubmitBtn.disabled = false;
                subSubmitBtn.style.opacity = '1';
                subSubmitBtn.style.cursor = 'pointer';
                if (minWarning) minWarning.style.display = 'none';
            }
        }
    }

    // Frequency Selection
    freqCards.forEach(card => {
        card.addEventListener('click', () => {
            freqCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentFreq.discount = parseInt(card.dataset.discount);
            currentFreq.label = card.querySelector('strong').textContent;
            currentFreq.months = parseInt(card.dataset.freq) || 1;
            updateSummary();
        });
    });

    const subForm = document.getElementById('subscription-form');
    if (subForm) {
        subForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = subForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '...';
            submitBtn.disabled = true;

            const formData = new FormData(subForm);
            const orderNumber = 'SUB-' + Math.floor(10000 + Math.random() * 90000);
            const lang = localStorage.getItem('preferredLang') || 'en';
            const unitStr = (translations[lang] && translations[lang].box) ? translations[lang].box : 'box';
            const totalStr = summaryTotal ? summaryTotal.textContent : '0 kr';

            let itemsSummary = "";
            const rows = document.querySelectorAll('.sub-item-row');
            rows.forEach(row => {
                const input = row.querySelector('.step-input');
                const qty = parseInt(input.value) || 0;

                if (qty > 0) {
                    const name = row.querySelector('strong').innerText.trim();
                    const qualityBtn = row.querySelector('.toggle-btn.active');
                    const quality = qualityBtn ? qualityBtn.getAttribute('data-quality') : 'standard';
                    const qLabel = (quality === 'bpa-free') ? 'Eco' : 'Std';
                    itemsSummary += `• ${name} (${unitStr}) (${qLabel}) x${qty}\n`;
                }
            });

            formData.append('Order Number', orderNumber);
            formData.append('Delivery Frequency', currentFreq.label);
            formData.append('Order Details', `Plan: ${currentFreq.label}\nItems:\n${itemsSummary}`);
            formData.append('Total Amount', totalStr);
            formData.append('payment', 'Subscription Billing');
            formData.append('Status', 'Pending');
            formData.append('FormSource', 'Subscription');

            // Using the same inventory script URL as it's likely the same deployment for handling POST?
            // Wait, usually the implementation uses the same Web App for GET (products) and POST (orders).
            // The USER provided inventory URL: https://script.google.com/macros/s/.../exec
            // Usually this is the same unless they deployed two different scripts.
            // I will assume it is the same script since the user said "in url google sheet...".

            const GOOGLE_SCRIPT_URL = SUB_INVENTORY_URL;

            try {
                // Security: Added timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 12000);

                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: formData,
                    mode: 'no-cors',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                const successModal = document.getElementById('order-success-modal');
                if (successModal) successModal.classList.add('active');
            } catch (err) {
                console.error("Subscription submission error:", err);
                alert('Error submitting subscription. Please try again.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Validation ... (Existing validation logic)
    const zipInput = document.getElementById('sub-zip');
    const cityInput = document.getElementById('sub-city');
    const zipMsg = document.getElementById('zip-msg');
    const zipStatus = document.getElementById('zip-status');

    if (zipInput && cityInput) {
        zipInput.addEventListener('input', async () => {
            const zip = zipInput.value.replace(/\s/g, '');
            const currentLang = localStorage.getItem('preferredLang') || 'en';

            if (zip.length === 5 && /^\d+$/.test(zip)) {
                if (zipMsg) zipMsg.textContent = (translations[currentLang] && translations[currentLang].validating_zip) || 'Checking...';
                if (zipStatus) zipStatus.textContent = '⏳';

                try {
                    const response = await fetch(`https://api.zippopotam.us/se/${zip}`);
                    if (response.ok) {
                        const data = await response.json();
                        const apiCity = data.places[0]['place name'];

                        if (!cityInput.value.trim()) {
                            cityInput.value = apiCity;
                            if (zipMsg) zipMsg.textContent = '';
                            if (zipStatus) zipStatus.textContent = '✅';
                        } else if (cityInput.value.trim().toLowerCase() !== apiCity.toLowerCase()) {
                            if (zipMsg) {
                                zipMsg.textContent = (translations[currentLang] && translations[currentLang].zip_mismatch) || 'Mismatch';
                                zipMsg.style.color = '#f59e0b';
                            }
                            if (zipStatus) zipStatus.textContent = '⚠️';
                        } else {
                            if (zipMsg) zipMsg.textContent = '';
                            if (zipStatus) zipStatus.textContent = '✅';
                        }
                    } else {
                        if (zipMsg) {
                            zipMsg.textContent = (translations[currentLang] && translations[currentLang].invalid_zip) || 'Invalid';
                            zipMsg.style.color = '#ef4444';
                        }
                        if (zipStatus) zipStatus.textContent = '❌';
                    }
                } catch (err) {
                    if (zipStatus) zipStatus.textContent = '';
                }
            } else {
                if (zipMsg) zipMsg.textContent = '';
                if (zipStatus) zipStatus.textContent = '';
            }
        });
    }

    // Event listeners for recalculation (Language change)
    // We need to re-render descriptions if lang changes, or just update labels. 
    // Simpler to rely on updateSummary for total but re-render might be needed for names?
    // Actually, updateSummary updates the summary list names. 
    // BUT the product rows THEMSELVES (the <strong>Name</strong>) won't update automatically unless we explicitly handle it.
    // Let's add a reload on language change.

    window.addEventListener('languageChanged', () => {
        // Re-load products to get translated names
        loadSubscriptionProducts();
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'preferredLang') {
            loadSubscriptionProducts();
        }
    });

    // Custom helper for internal redirects in success modal
    const homeBtn = document.getElementById('go-home-success');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Start Loading
    loadSubscriptionProducts();
});
