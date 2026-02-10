const INVENTORY_URL = "https://script.google.com/macros/s/AKfycbzY76x2MWrVCngVagvfJxl4THpMwTRaIltNbfZTbnby4ca-9jP247OKAGvrD4Hnl5fB/exec";
const CACHE_KEY = 'nordic_inventory_cache';
const POLL_INTERVAL = 60000; // Check for updates every 60 seconds

let fetchedProducts = [];

async function loadInventory(isPolling = false) {
    const grid = document.getElementById('dynamic-product-grid');
    if (!grid) return;

    if (!INVENTORY_URL) {
        console.warn("Inventory URL is empty.");
        return;
    }

    // 1. Instant Load from Cache (only on initial load)
    if (!isPolling) {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
            try {
                fetchedProducts = JSON.parse(cachedData);
                if (fetchedProducts.length > 0) {
                    renderProducts();
                    console.log("Loaded from cache.");
                }
            } catch (e) {
                console.error("Cache parse error", e);
            }
        }
    }

    // 2. Fetch fresh data
    try {
        const response = await fetch(INVENTORY_URL);
        const liveData = await response.json();

        // 3. Compare and Update if different
        if (JSON.stringify(liveData) !== JSON.stringify(fetchedProducts)) {
            fetchedProducts = liveData;
            localStorage.setItem(CACHE_KEY, JSON.stringify(liveData));

            if (fetchedProducts && fetchedProducts.length > 0) {
                renderProducts();
                console.log("Inventory updated from live source.");
            } else {
                console.warn("Inventory loaded but came back empty.");
                if (!isPolling) {
                    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.7;">No products available at the moment.</p>`;
                }
            }
        }
    } catch (e) {
        console.error("Failed to load inventory:", e);
        if (!isPolling && fetchedProducts.length === 0) {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Error loading products. Please try again later.</p>`;
        }
    }
}

const t = (key) => {
    const lang = localStorage.getItem('preferredLang') || 'en';
    return (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) ? translations[lang][key] : key;
};

function renderProducts() {
    const grid = document.getElementById('dynamic-product-grid');
    if (!grid || !fetchedProducts.length) return;

    grid.innerHTML = '';
    fetchedProducts.forEach(prod => {
        grid.appendChild(createProductCard(prod));
    });
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
                <div class="unit-option active" data-unit="box">${t('box') || 'Box'}</div>
                <div class="unit-option" data-unit="roll">${t('roll') || 'Roll'}</div>
            </div>
            <p class="price"><span>${p.price_box}</span> kr</p>
            <div class="quantity-selector">
                <button class="qty-btn minus">-</button>
                <input type="number" class="qty-input" value="1" min="1">
                <button class="qty-btn plus">+</button>
            </div>
            <button class="btn btn-secondary" data-i18n="add_to_cart">${t('add_to_cart') || 'Add to Cart'}</button>
        </div>
    `;

    // Wire up unit selector logic immediately for this card
    const units = div.querySelectorAll('.unit-option');
    const priceDisplay = div.querySelector('.price span');

    units.forEach(u => {
        u.addEventListener('click', () => {
            units.forEach(btn => btn.classList.remove('active'));
            u.classList.add('active');

            const unit = u.dataset.unit;
            if (unit === 'box') {
                priceDisplay.textContent = p.price_box;
            } else {
                priceDisplay.textContent = p.price_roll;
            }
        });
    });

    // Wire up quantity
    const minus = div.querySelector('.minus');
    const plus = div.querySelector('.plus');
    const input = div.querySelector('.qty-input');

    minus.addEventListener('click', () => {
        let val = parseInt(input.value) || 1;
        if (val > 1) input.value = val - 1;
    });

    plus.addEventListener('click', () => {
        let val = parseInt(input.value) || 1;
        input.value = val + 1;
    });

    return div;
}

document.addEventListener('DOMContentLoaded', () => {
    loadInventory(); // Initial load
    setInterval(() => loadInventory(true), POLL_INTERVAL); // Start polling
});
