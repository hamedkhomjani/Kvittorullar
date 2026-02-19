(function () {
    function initA11y() {
        if (document.getElementById('a11y-trigger')) return; // Already initialized

        console.log('NordicRoll A11y: Initializing...');

        try {
            // Create and inject the Accessibility Widget
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

            // Elements
            const trigger = document.getElementById('a11y-trigger');
            const menu = document.getElementById('a11y-menu');
            const closeBtn = document.getElementById('a11y-close');
            const buttons = document.querySelectorAll('.a11y-btn');

            if (!trigger || !menu || !closeBtn) {
                console.error('NordicRoll A11y: Required elements not found after injection');
                return;
            }

            // Toggle Menu
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('active');
                trigger.setAttribute('aria-expanded', menu.classList.contains('active'));
                console.log('NordicRoll A11y: Menu toggled', menu.classList.contains('active'));
            });

            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.remove('active');
                trigger.setAttribute('aria-expanded', 'false');
            });

            // Close on click outside
            document.addEventListener('click', (e) => {
                if (menu.classList.contains('active') && !menu.contains(e.target) && !trigger.contains(e.target)) {
                    menu.classList.remove('active');
                    trigger.setAttribute('aria-expanded', 'false');
                }
            });

            // Actions
            const actions = {
                'font-normal': () => {
                    document.documentElement.classList.remove('font-xl', 'font-xxl');
                    setActive('font-normal');
                },
                'font-large': () => {
                    document.documentElement.classList.remove('font-xxl');
                    document.documentElement.classList.add('font-xl');
                    setActive('font-large');
                },
                'font-xl': () => {
                    document.documentElement.classList.remove('font-xl');
                    document.documentElement.classList.add('font-xxl');
                    setActive('font-xl');
                },
                'toggle-contrast': () => {
                    document.documentElement.classList.toggle('a11y-high-contrast');
                    const btn = document.getElementById('btn-contrast');
                    if (btn) btn.classList.toggle('active');
                    saveSettings();
                },
                'toggle-greyscale': () => {
                    document.documentElement.classList.toggle('a11y-greyscale');
                    const btn = document.getElementById('btn-greyscale');
                    if (btn) btn.classList.toggle('active');
                    saveSettings();
                },
                'reset-all': () => {
                    document.documentElement.classList.remove('font-xl', 'font-xxl', 'a11y-high-contrast', 'a11y-greyscale');
                    buttons.forEach(btn => btn.classList.remove('active'));
                    const normalBtn = document.getElementById('btn-font-normal');
                    if (normalBtn) normalBtn.classList.add('active');
                    localStorage.removeItem('a11y-settings');
                    console.log('NordicRoll A11y: Settings reset');
                }
            };

            function setActive(actionGroup) {
                if (actionGroup.startsWith('font-')) {
                    ['font-normal', 'font-large', 'font-xl'].forEach(a => {
                        const btn = document.querySelector(`[data-action="${a}"]`);
                        if (btn) {
                            if (a === actionGroup) btn.classList.add('active');
                            else btn.classList.remove('active');
                        }
                    });
                }
                saveSettings();
            }

            // Event Delegation for buttons
            menu.addEventListener('click', (e) => {
                const btn = e.target.closest('.a11y-btn');
                if (btn) {
                    const action = btn.dataset.action;
                    if (actions[action]) {
                        console.log('NordicRoll A11y: Action triggered:', action);
                        actions[action]();
                    }
                }
            });

            // Save and Load Settings
            function saveSettings() {
                try {
                    const settings = {
                        fontSize: document.documentElement.classList.contains('font-xxl') ? 'font-xl' :
                            (document.documentElement.classList.contains('font-xl') ? 'font-large' : 'font-normal'),
                        highContrast: document.documentElement.classList.contains('a11y-high-contrast'),
                        greyscale: document.documentElement.classList.contains('a11y-greyscale')
                    };
                    localStorage.setItem('a11y-settings', JSON.stringify(settings));
                } catch (e) {
                    console.warn('NordicRoll A11y: Could not save settings', e);
                }
            }

            function loadSettings() {
                try {
                    const saved = localStorage.getItem('a11y-settings');
                    if (saved) {
                        const settings = JSON.parse(saved);
                        if (settings.fontSize && actions[settings.fontSize]) {
                            actions[settings.fontSize]();
                        }
                        if (settings.highContrast) {
                            document.documentElement.classList.add('a11y-high-contrast');
                            const btn = document.getElementById('btn-contrast');
                            if (btn) btn.classList.add('active');
                        }
                        if (settings.greyscale) {
                            document.documentElement.classList.add('a11y-greyscale');
                            const btn = document.getElementById('btn-greyscale');
                            if (btn) btn.classList.add('active');
                        }
                        console.log('NordicRoll A11y: Settings loaded');
                    } else {
                        const btn = document.getElementById('btn-font-normal');
                        if (btn) btn.classList.add('active');
                    }
                } catch (e) {
                    console.warn('NordicRoll A11y: Error loading settings', e);
                }
            }

            loadSettings();

            // Re-apply translations for the new elements
            const currentLang = localStorage.getItem('preferredLang') || 'en';
            if (typeof window.applyTranslations === 'function') {
                window.applyTranslations(currentLang);
            }

            console.log('NordicRoll A11y: Initialization complete');
        } catch (err) {
            console.error('NordicRoll A11y: critical failure during initialization', err);
        }
    }

    // Keyboard Navigation Detection
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.documentElement.classList.add('user-is-tabbing');
        }
    });

    window.addEventListener('mousedown', () => {
        document.documentElement.classList.remove('user-is-tabbing');
    });

    // Run on DOMContentLoaded or immediately if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initA11y);
    } else {
        initA11y();
    }
})();
