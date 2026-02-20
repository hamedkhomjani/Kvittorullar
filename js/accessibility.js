(function () {
    // 1. Core Logic & State Management (Applies immediately)
    const settingsKey = 'a11y-settings';

    function getSettings() {
        try {
            const saved = localStorage.getItem(settingsKey);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.warn('NordicRoll A11y: Error reading settings', e);
            return null;
        }
    }

    function applyState() {
        const settings = getSettings();
        const html = document.documentElement;

        if (settings) {
            // Text Size
            html.classList.remove('font-xl', 'font-xxl');
            if (settings.fontSize === 'font-large') html.classList.add('font-xl');
            else if (settings.fontSize === 'font-xl') html.classList.add('font-xxl');

            // Contrast
            if (settings.highContrast) html.classList.add('a11y-high-contrast');
            else html.classList.remove('a11y-high-contrast');

            // Greyscale
            if (settings.greyscale) html.classList.add('a11y-greyscale');
            else html.classList.remove('a11y-greyscale');

            console.log('NordicRoll A11y: State applied', settings);
        }

        // Update menu buttons if they exist
        updateButtonsUI();
    }

    function saveSettings(settings) {
        try {
            localStorage.setItem(settingsKey, JSON.stringify(settings));
            // Dispatch event for other tabs
            window.dispatchEvent(new Event('a11yUpdated'));
        } catch (e) {
            console.warn('NordicRoll A11y: Error saving settings', e);
        }
    }

    function updateButtonsUI() {
        const settings = getSettings();
        if (!settings) return;

        const html = document.documentElement;

        // Font buttons
        const fontActions = ['font-normal', 'font-large', 'font-xl'];
        fontActions.forEach(action => {
            const btn = document.querySelector(`[data-action="${action}"]`);
            if (btn) {
                const isActive = (action === 'font-normal' && !html.classList.contains('font-xl') && !html.classList.contains('font-xxl')) ||
                    (action === 'font-large' && html.classList.contains('font-xl')) ||
                    (action === 'font-xl' && html.classList.contains('font-xxl'));
                btn.classList.toggle('active', isActive);
            }
        });

        // Toggle buttons
        const contrastBtn = document.getElementById('btn-contrast');
        if (contrastBtn) contrastBtn.classList.toggle('active', html.classList.contains('a11y-high-contrast'));

        const greyscaleBtn = document.getElementById('btn-greyscale');
        if (greyscaleBtn) greyscaleBtn.classList.toggle('active', html.classList.contains('a11y-greyscale'));
    }

    // Apply state as soon as the script loads
    applyState();

    // Sync across tabs
    window.addEventListener('storage', (e) => {
        if (e.key === settingsKey) applyState();
    });

    // 2. UI Injection (Waits for DOM)
    function initA11yUI() {
        if (document.getElementById('a11y-trigger')) return;

        try {
            const widgetHTML = `
                <button id="a11y-trigger" class="a11y-trigger" aria-label="Accessibility Menu" title="Accessibility Options">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="pointer-events: none;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 8v8M8 12h8"></path>
                        <path d="M12 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path>
                        <path d="M12 18v2"></path>
                    </svg>
                </button>
                <div id="a11y-menu" class="a11y-menu" role="dialog" aria-labelledby="a11y-title">
                    <h2 id="a11y-title"><span data-i18n="a11y_title">Accessibility</span> <button class="a11y-close" id="a11y-close" aria-label="Close">&times;</button></h2>
                    <div class="a11y-group">
                        <span class="a11y-label" data-i18n="a11y_text_size">Text Size</span>
                        <div class="a11y-controls">
                            <button class="a11y-btn" data-action="font-normal" id="btn-font-normal" data-i18n="a11y_font_normal">Normal</button>
                            <button class="a11y-btn" data-action="font-large" id="btn-font-large" data-i18n="a11y_font_large">Large</button>
                            <button class="a11y-btn" data-action="font-xl" id="btn-font-xl" data-i18n="a11y_font_xl">Extra Large</button>
                        </div>
                    </div>
                    <div class="a11y-group">
                        <span class="a11y-label" data-i18n="a11y_visual_modes">Visual Modes</span>
                        <div class="a11y-controls">
                            <button class="a11y-btn" data-action="toggle-contrast" id="btn-contrast" data-i18n="a11y_contrast">High Contrast</button>
                            <button class="a11y-btn" data-action="toggle-greyscale" id="btn-greyscale" data-i18n="a11y_greyscale">Greyscale</button>
                        </div>
                    </div>
                    <div class="a11y-group">
                        <span class="a11y-label" data-i18n="a11y_tools">Tools</span>
                        <div class="a11y-controls">
                            <button class="a11y-btn" data-action="reset-all" style="grid-column: span 2;" data-i18n="a11y_reset">Reset All Settings</button>
                        </div>
                    </div>
                </div>
            `;

            const widgetContainer = document.createElement('div');
            widgetContainer.id = "a11y-widget-container";
            widgetContainer.innerHTML = widgetHTML;
            document.body.appendChild(widgetContainer);

            const trigger = document.getElementById('a11y-trigger');
            const menu = document.getElementById('a11y-menu');
            const closeBtn = document.getElementById('a11y-close');

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('active');
                trigger.setAttribute('aria-expanded', menu.classList.contains('active'));
            });

            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.remove('active');
                trigger.setAttribute('aria-expanded', 'false');
            });

            document.addEventListener('click', (e) => {
                if (menu.classList.contains('active') && !menu.contains(e.target) && !trigger.contains(e.target)) {
                    menu.classList.remove('active');
                    trigger.setAttribute('aria-expanded', 'false');
                }
            });

            // Action handling
            menu.addEventListener('click', (e) => {
                const btn = e.target.closest('.a11y-btn');
                if (!btn) return;

                const action = btn.dataset.action;
                const html = document.documentElement;
                let currentSettings = getSettings() || { fontSize: 'font-normal', highContrast: false, greyscale: false };

                switch (action) {
                    case 'font-normal':
                        html.classList.remove('font-xl', 'font-xxl');
                        currentSettings.fontSize = 'font-normal';
                        break;
                    case 'font-large':
                        html.classList.remove('font-xxl');
                        html.classList.add('font-xl');
                        currentSettings.fontSize = 'font-large';
                        break;
                    case 'font-xl':
                        html.classList.remove('font-xl');
                        html.classList.add('font-xxl');
                        currentSettings.fontSize = 'font-xl';
                        break;
                    case 'toggle-contrast':
                        const isContrast = html.classList.toggle('a11y-high-contrast');
                        currentSettings.highContrast = isContrast;
                        break;
                    case 'toggle-greyscale':
                        const isGrey = html.classList.toggle('a11y-greyscale');
                        currentSettings.greyscale = isGrey;
                        break;
                    case 'reset-all':
                        html.classList.remove('font-xl', 'font-xxl', 'a11y-high-contrast', 'a11y-greyscale');
                        currentSettings = { fontSize: 'font-normal', highContrast: false, greyscale: false };
                        break;
                }

                saveSettings(currentSettings);
                updateButtonsUI();
            });

            updateButtonsUI();

            // Re-apply translations
            const currentLang = localStorage.getItem('preferredLang') || 'en';
            if (typeof window.applyTranslations === 'function') {
                window.applyTranslations(currentLang);
            }
        } catch (err) {
            console.error('NordicRoll A11y: UI initialization failed', err);
        }
    }

    // Keyboard support
    window.addEventListener('keydown', (e) => { if (e.key === 'Tab') document.documentElement.classList.add('user-is-tabbing'); });
    window.addEventListener('mousedown', () => { document.documentElement.classList.remove('user-is-tabbing'); });

    // Initialize UI
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initA11yUI);
    } else {
        initA11yUI();
    }
})();
