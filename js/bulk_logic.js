/**
 * NordicRoll - Bulk Order Builder Logic
 * Handles calculations, tiered pricing, and PDF generation.
 */
document.addEventListener('DOMContentLoaded', () => {
    const itemRows = document.querySelectorAll('.bulk-item-row');
    const totalQtyDisplay = document.getElementById('total-qty');
    const totalPriceDisplay = document.getElementById('total-price');
    const savingsBadge = document.getElementById('savings-badge');
    const minWarning = document.getElementById('min-warning');
    const downloadBtn = document.getElementById('download-pdf-btn');

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

    // Event listeners for recalculation
    window.addEventListener('languageChanged', calculate);
    window.addEventListener('storage', (e) => {
        if (e.key === 'preferredLang') calculate();
    });

    // Stepper logic
    itemRows.forEach(row => {
        const minus = row.querySelector('.minus');
        const plus = row.querySelector('.plus');
        const input = row.querySelector('.bulk-qty-input');

        if (minus) {
            minus.addEventListener('click', () => {
                const val = parseInt(input.value) || 0;
                if (val > 0) {
                    input.value = val - 1;
                    calculate();
                }
            });
        }

        if (plus) {
            plus.addEventListener('click', () => {
                const val = parseInt(input.value) || 0;
                input.value = val + 1;
                calculate();
            });
        }

        if (input) {
            input.addEventListener('input', calculate);
        }
    });

    // Initial calculation
    calculate();

    // --- PDF Generation Logic ---
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (!window.jspdf) {
                console.error("jsPDF not loaded");
                return;
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            const currentLang = localStorage.getItem('preferredLang') || 'en';
            const isEnglish = currentLang === 'en';
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

            // PDF Design
            doc.setFontSize(22);
            doc.setTextColor(59, 130, 246);
            // Note: jsPDF standard fonts do not support non-Latin characters (like Persian).
            // We use English fallback for the title if current charset isn't supported, but we'll try localized labels.
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
            itemRows.forEach(row => {
                const qtyInput = row.querySelector('.bulk-qty-input');
                const qty = parseInt(qtyInput.value) || 0;
                if (qty > 0) {
                    const nameKey = row.querySelector('strong span').getAttribute('data-i18n');
                    let name = row.querySelector('strong span').textContent;

                    // Try to get translated name
                    if (langData && nameKey && langData[nameKey]) {
                        name = langData[nameKey];
                    }

                    // Fallback: If name contains non-Latin and current font is helvetica, 
                    // jsPDF might fail. We use the textContent which is already in the DOM.
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
            doc.setFontSize(14);
            doc.text(texts.totalQtyLabel, 120, y, { align: "right" });
            doc.text(totalQty, 180, y, { align: "right" });
            y += 10;
            doc.setFontSize(16);
            doc.setTextColor(59, 130, 246);
            doc.text(texts.estPriceLabel, 120, y, { align: "right" });
            doc.text(totalPrice, 180, y, { align: "right" });

            y += 30;
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.setFont("helvetica", "italic");
            doc.text(texts.footer1, 20, y);
            doc.text(texts.footer2, 20, y + 5);

            doc.save(currentLang === 'en' ? "nordicroll-quote.pdf" : `nordicroll-offert-${currentLang}.pdf`);
        });
    }

    // Additional UI helpers
    const processBtn = document.getElementById('view-process-btn');
    if (processBtn) {
        processBtn.addEventListener('click', () => {
            const processSection = document.querySelector('.process-section');
            if (processSection) {
                processSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});
