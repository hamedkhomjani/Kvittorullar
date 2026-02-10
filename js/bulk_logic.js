/**
 * NordicRoll - Bulk Order Builder Logic
 * Handles calculations, tiered pricing, and PDF generation.
 */

const BULK_INVENTORY_URL = "https://script.google.com/macros/s/AKfycbzY76x2MWrVCngVagvfJxl4THpMwTRaIltNbfZTbnby4ca-9jP247OKAGvrD4Hnl5fB/exec";
const CACHE_KEY = 'nordic_inventory_cache';
const POLL_INTERVAL = 60000;

document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.getElementById('bulk-items-container');
    const totalQtyDisplay = document.getElementById('total-qty');
    const totalPriceDisplay = document.getElementById('total-price');
    const savingsBadge = document.getElementById('savings-badge');
    const minWarning = document.getElementById('min-warning');
    const downloadBtn = document.getElementById('download-pdf-btn');

    let fetchedProducts = [];

    // --- Dynamic Loading Logic ---
    async function loadBulkProducts(isPolling = false) {
        if (!itemsContainer) return;

        // 1. Instant Load from Cache
        if (!isPolling) {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    fetchedProducts = JSON.parse(cached);
                    if (fetchedProducts.length > 0) {
                        // Maintain existing input values if re-rendering? 
                        // Actually if we re-render entirely we lose input state.
                        // Better check if we really need to re-render.
                        renderBulkRows(fetchedProducts);
                        console.log("Bulk loaded from cache.");
                    }
                } catch (e) { console.error(e); }
            }
        }

        try {
            const response = await fetch(BULK_INVENTORY_URL);
            const liveData = await response.json();

            // 2. Compare. If different, we update.
            // CAUTION: Re-rendering wipes out user inputs (quantities).
            // We should only re-render if data CHANGED physically (prices/names).
            // And if user has inputs, maybe warn? or try to preserve them.
            // For simplicity, we just check deep equality of source data.

            // Check if fetchedProducts is empty (first load) OR different
            if (JSON.stringify(liveData) !== JSON.stringify(fetchedProducts)) {

                // Preserve current quantities if possible
                const currentQuantities = {};
                document.querySelectorAll('.bulk-item-row').forEach(row => {
                    const id = row.dataset.id; // We need an ID
                    const val = row.querySelector('.bulk-qty-input').value;
                    if (id) currentQuantities[id] = val;
                });

                fetchedProducts = liveData;
                localStorage.setItem(CACHE_KEY, JSON.stringify(liveData));
                renderBulkRows(fetchedProducts, currentQuantities);

                console.log("Bulk inventory updated from live source.");
            }
        } catch (e) {
            console.error("Failed to load bulk products:", e);
            if (!isPolling && itemsContainer.innerHTML.includes('loading-spinner')) {
                itemsContainer.innerHTML = '<p class="error-msg">Error loading products. Please try refreshing.</p>';
            }
        }
    }

    function renderBulkRows(products, preservedQuantities = {}) {
        itemsContainer.innerHTML = '';
        const lang = localStorage.getItem('preferredLang') || 'en';

        // Helper to get translated string
        const t = (key) => (translations[lang] && translations[lang][key]) ? translations[lang][key] : key;

        products.forEach((p, index) => {
            const row = document.createElement('div');
            row.className = 'bulk-item-row';
            row.dataset.id = p.key || index; // Use key from sheet or index
            row.dataset.price = p.price_box;

            // Styles
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.justifyContent = 'space-between';
            row.style.padding = '1.5rem';
            row.style.background = 'var(--bg-alt)';
            row.style.borderRadius = '1.5rem';

            const name = p[`name_${lang}`] || p.name_en || p.name;
            const info = p[`info_${lang}`] || p.info_en || '';
            const price = p.price_box;

            // initialQty: if preserved exists, use it. Else if first load (no preserved), default 0 (as requested).
            let val = 0;
            if (preservedQuantities[row.dataset.id]) {
                val = preservedQuantities[row.dataset.id];
            }
            // Note: User requested initial load to be 0 for all.

            row.innerHTML = `
                <div>
                    <strong style="display: flex; align-items: center; gap: 0.5rem;">
                        <span>${name}</span>
                        ${info ? `
                        <span class="info-trigger">ⓘ
                            <span class="tooltip-box">${info}</span>
                        </span>` : ''}
                    </strong>
                    <small style="color: var(--text-light);">
                        <span>${t('base_price') || 'Base Price'}</span>: ${price} kr
                    </small>
                </div>
                <div class="stepper">
                    <button class="bulk-qty-btn minus" type="button">-</button>
                    <input type="number" class="bulk-qty-input" value="${val}" min="0">
                    <button class="bulk-qty-btn plus" type="button">+</button>
                </div>
            `;
            itemsContainer.appendChild(row);
        });

        // Re-initialize logic
        initializeBulkListeners();
        calculate();
    }

    function initializeBulkListeners() {
        const itemRows = document.querySelectorAll('.bulk-item-row'); // Scope search

        itemRows.forEach(row => {
            const minus = row.querySelector('.minus');
            const plus = row.querySelector('.plus');
            const input = row.querySelector('.bulk-qty-input');

            if (minus) {
                minus.addEventListener('click', (e) => {
                    e.preventDefault();
                    const val = parseInt(input.value) || 0;
                    if (val > 0) {
                        input.value = val - 1;
                        calculate();
                    }
                });
            }

            if (plus) {
                plus.addEventListener('click', (e) => {
                    e.preventDefault();
                    const val = parseInt(input.value) || 0;
                    input.value = val + 1;
                    calculate();
                });
            }

            if (input) {
                input.addEventListener('input', calculate);
            }
        });
    }

    function calculate() {
        let totalQty = 0;
        let totalBasePrice = 0;

        const rows = document.querySelectorAll('.bulk-item-row');
        rows.forEach(row => {
            const price = parseInt(row.dataset.price);
            const input = row.querySelector('.bulk-qty-input');
            const qty = parseInt(input.value) || 0;

            totalQty += qty;
            totalBasePrice += (price * qty);
        });

        let discount = 0;
        let discountText = "";

        if (totalQty >= 1000) {
            discount = 0.35;
            discountText = "35%";
        } else if (totalQty >= 500) {
            discount = 0.20;
            discountText = "20%";
        } else if (totalQty >= 100) {
            discount = 0.10;
            discountText = "10%";
        } else if (totalQty >= 20) {
            discount = 0.05;
            discountText = "5%";
        }

        const finalPrice = totalBasePrice * (1 - discount);

        const currentLang = localStorage.getItem('preferredLang') || document.documentElement.getAttribute('lang') || 'en';
        const langData = (typeof translations !== 'undefined' && translations[currentLang]) ? translations[currentLang] : (typeof translations !== 'undefined' && translations['en']) ? translations['en'] : {};

        const boxUnit = langData.box || "boxes";
        const saveText = langData.save_badge || "SAVE";
        const minWarningText = langData.min_bulk_warning || "Minimum total order is 20 boxes.";

        if (totalQtyDisplay) totalQtyDisplay.textContent = `${totalQty} ${boxUnit}`;
        if (totalPriceDisplay) totalPriceDisplay.textContent = Math.round(finalPrice).toLocaleString() + " kr";

        if (savingsBadge) {
            if (discount > 0) {
                savingsBadge.style.display = 'block';
                savingsBadge.textContent = `${saveText} ${discountText}`;
            } else {
                savingsBadge.style.display = 'none';
            }
        }

        if (minWarning && downloadBtn) {
            if (totalQty < 20) {
                minWarning.style.display = 'block';
                minWarning.textContent = `⚠️ ${minWarningText}`;
                downloadBtn.style.opacity = '0.5';
                downloadBtn.style.pointerEvents = 'none';
            } else {
                minWarning.style.display = 'none';
                downloadBtn.style.opacity = '1';
                downloadBtn.style.pointerEvents = 'auto';
            }
        }
    }

    // Event listeners
    window.addEventListener('languageChanged', () => loadBulkProducts(false)); // Re-render immediatley on lang change (from cache mostly)

    // Start Logic
    loadBulkProducts();
    setInterval(() => loadBulkProducts(true), POLL_INTERVAL);

    // --- PDF Logic ---
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (!window.jspdf) {
                console.error("jsPDF not loaded");
                return;
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            const currentLang = localStorage.getItem('preferredLang') || 'en';
            const langData = translations[currentLang] || translations['en'];

            const texts = {
                title: langData.pdf_quote_title || "NordicRoll - Quote",
                dateLabel: langData.pdf_date || "Date:",
                generated: langData.pdf_generated || "Generated from nordicroll.com",
                colItem: langData.pdf_col_item || "Item",
                colQty: langData.pdf_col_qty || "Quantity",
                colTotal: langData.pdf_col_total || "Total",
                totalQtyLabel: langData.total_quantity_label || "Total Quantity:",
                estPriceLabel: langData.estimated_total_price || "Estimated Price:",
                footer1: langData.pdf_footer1 || "* Valid for 30 days.",
                footer2: langData.pdf_footer2 || "Contact sales@nordicroll.com"
            };

            const date = new Date().toLocaleDateString(currentLang === 'sv' ? 'sv-SE' : (currentLang === 'fa' ? 'fa-IR' : 'en-US'));
            const totalQty = totalQtyDisplay ? totalQtyDisplay.textContent : '0';
            const totalPrice = totalPriceDisplay ? totalPriceDisplay.textContent : '0 kr';

            doc.setFontSize(22);
            doc.setTextColor(59, 130, 246);
            doc.text(texts.title, 20, 20);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`${texts.dateLabel} ${date}`, 20, 30);
            doc.text(texts.generated, 20, 35);

            let y = 50;
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.setFont("helvetica", "bold");
            doc.text(texts.colItem, 20, y);
            doc.text(texts.colQty, 140, y, { align: "right" });
            doc.text(texts.colTotal, 180, y, { align: "right" });

            doc.setDrawColor(200);
            doc.line(20, y + 2, 190, y + 2);
            y += 10;

            doc.setFont("helvetica", "normal");

            const rows = document.querySelectorAll('.bulk-item-row');
            rows.forEach(row => {
                const qtyInput = row.querySelector('.bulk-qty-input');
                const qty = parseInt(qtyInput.value) || 0;
                if (qty > 0) {
                    let nameElem = row.querySelector('strong span');
                    let name = nameElem ? nameElem.textContent : 'Product';
                    name = name.length > 40 ? name.substring(0, 37) + '...' : name;

                    const basePrice = parseInt(row.dataset.price);
                    const rowTotal = (basePrice * qty).toLocaleString('sv-SE') + ' kr';

                    doc.text(name, 20, y);
                    doc.text(qty.toString(), 140, y, { align: "right" });
                    doc.text(rowTotal, 180, y, { align: "right" });
                    y += 10;
                }
            });

            y += 5;
            doc.line(20, y, 190, y);
            y += 10;

            doc.setFont("helvetica", "bold");
            doc.text(`${texts.totalQtyLabel} ${totalQty}`, 180, y, { align: "right" });
            y += 7;
            doc.setTextColor(59, 130, 246);
            doc.setFontSize(14);
            doc.text(`${texts.estPriceLabel} ${totalPrice}`, 180, y, { align: "right" });

            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(texts.footer1, 20, 280);
            doc.text(texts.footer2, 20, 285);

            doc.save("NordicRoll_Quote.pdf");
        });
    }
});
