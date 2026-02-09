const INVENTORY_URL = "https://script.google.com/macros/s/AKfycbyGoX_zpfGc8rG0G-Ik7Qm_rX0s8bQd4zefxg2h9IUSzXwcFNAdJazlp_mxqJNkc7cE/exec"; // لینک Web App گوگل را اینجا قرار دهید

let fetchedProducts = [];

async function loadInventory() {
    const grid = document.getElementById('dynamic-product-grid');
    if (!grid) return;

    if (!INVENTORY_URL) {
        console.warn("Inventory URL is empty. Add your Google Apps Script URL to js/inventory.js");
        return;
    }

    try {
        const response = await fetch(INVENTORY_URL);
        fetchedProducts = await response.json();

        if (fetchedProducts && fetchedProducts.length > 0) {
            renderProducts();

            // Apply initial translations to static elements (like "Box", "Roll")
            const currentLang = localStorage.getItem('preferredLang') || 'en';
            if (typeof window.applyTranslations === 'function') {
                window.applyTranslations(currentLang);
            }
        } else {
            console.warn("Inventory loaded but came back empty.");
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.7;">No products available at the moment.</p>`;
        }
    } catch (e) {
        console.error("Failed to load inventory:", e);
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Error loading products. Please try again later.</p>`;
    }
}

function renderProducts() {
    const grid = document.getElementById('dynamic-product-grid');
    if (!grid || !fetchedProducts.length) return;

    grid.innerHTML = '';
    fetchedProducts.forEach(prod => {
        grid.appendChild(createProductCard(prod));
    });

    // Re-apply translations for static UI elements within the new cards
    const currentLang = localStorage.getItem('preferredLang') || 'en';
    if (typeof window.applyTranslations === 'function') {
        window.applyTranslations(currentLang);
    }
}

// Re-render products when language changes
window.addEventListener('languageChanged', () => {
    if (fetchedProducts.length > 0) {
        renderProducts();
    }
});

function createProductCard(p) {
    const lang = localStorage.getItem('preferredLang') || 'en';
    const name = p[`name_${lang}`] || p.name_en || 'Product';
    const info = p[`info_${lang}`] || p.info_en || '';
    const badge = p[`badge_${lang}`] || p.badge_en || '';

    const div = document.createElement('div');
    div.className = 'product-card';
    div.dataset.productKey = p.key;
    div.dataset.boxPrice = p.price_box;
    div.dataset.rollPrice = p.price_roll;

    div.innerHTML = `
        ${badge ? `<span class="card-badge">${badge}</span>` : ''}
        <div class="product-preview">
            <img src="${p.image}" alt="${name}" loading="lazy">
        </div>
        <div class="product-info">
            <h3>
                <span>${name}</span>
                <span class="info-trigger">ⓘ
                    <span class="tooltip-box">${info}</span>
                </span>
            </h3>
            <div class="unit-selector">
                <div class="unit-option active" data-unit="box" data-i18n="box">Box</div>
                <div class="unit-option" data-unit="roll" data-i18n="roll">Roll</div>
            </div>
            <p class="price"><span>${p.price_box}</span> kr</p>
            <div class="quantity-selector">
                <button class="qty-btn minus">-</button>
                <input type="number" class="qty-input" value="1" min="1">
                <button class="qty-btn plus">+</button>
            </div>
            <button class="btn btn-secondary" data-i18n="add_to_cart">Add to Cart</button>
        </div>
    `;
    return div;
}

document.addEventListener('DOMContentLoaded', loadInventory);
