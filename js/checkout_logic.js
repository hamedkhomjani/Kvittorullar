/**
 * NordicRoll - Checkout Logic
 * Handles cart sync, form submission to Google Sheets, and UI validation.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initial render of summary
    if (window.updateCheckoutSummary) window.updateCheckoutSummary();

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Honeypot check
            const honeypot = checkoutForm.querySelector('input[name="bot_field"]');
            if (honeypot && honeypot.value !== '') {
                console.warn("Bot submission prevented.");
                return;
            }

            const submitBtn = document.getElementById('submit-order-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '...';
            submitBtn.disabled = true;

            const formData = new FormData(checkoutForm);
            const orderNumber = 'NR-' + Math.floor(10000 + Math.random() * 90000);

            // Add simplified details to the submission (Fixes JSON viewing issue)
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const currentLang = localStorage.getItem('preferredLang') || 'en';

            const orderSummary = cart.map(item => {
                const unitLabel = (translations[currentLang] && translations[currentLang][item.unit])
                    ? translations[currentLang][item.unit]
                    : item.unit;

                const baseName = (translations[currentLang] && item.key)
                    ? (translations[currentLang][item.key + '_title'] || item.name)
                    : item.name;

                return `${baseName} (${unitLabel}) x${item.quantity} - ${item.price * item.quantity} kr`;
            }).join('\n');

            formData.append('Order Number', orderNumber);
            formData.append('Order Details', orderSummary);
            formData.append('Total Amount', document.getElementById('checkout-total').textContent);
            formData.append('Status', 'Pending');
            formData.append('FormSource', 'Checkout');

            // --- GOOGLE SHEETS SETTINGS ---
            const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwIIKpsHGvqa3f3RxWcB9_OAYEpgIkx8jbnq63X5cOneof-7kos0nzUR5iOonsYirYHIw/exec';
            const API_URL = GOOGLE_SCRIPT_URL;

            try {
                // Security: Added timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 12000);

                const response = await fetch(API_URL, {
                    method: 'POST',
                    body: formData,
                    mode: 'no-cors',
                    signal: controller.signal,
                    headers: { 'Accept': 'application/json' }
                });

                clearTimeout(timeoutId);

                // Success logic
                const successModal = document.getElementById('order-success-modal');
                const orderNumDisplay = document.getElementById('order-number-display');

                if (orderNumDisplay) orderNumDisplay.textContent = orderNumber;

                if (successModal) {
                    successModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    const doneBtn = document.getElementById('success-done');
                    if (doneBtn) {
                        doneBtn.addEventListener('click', () => {
                            localStorage.removeItem('cart');
                            window.location.href = 'index.html';
                        }, { once: true });
                    }
                } else {
                    alert('Order placed! Your order number is: ' + orderNumber);
                    localStorage.removeItem('cart');
                    window.location.href = 'index.html';
                }
            } catch (err) {
                console.error('Checkout error:', err);
                alert('Connection error. Please check your internet and try again.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Sync payment method visual state
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });

    // Address & Zip Validation Logic
    const zipInput = document.getElementById('checkout-zip');
    const cityInput = document.getElementById('checkout-city');
    const zipMsg = document.getElementById('zip-msg');
    const zipStatus = document.getElementById('zip-status');

    if (zipInput && cityInput) {
        zipInput.addEventListener('input', async () => {
            const zip = zipInput.value.replace(/\s/g, '');
            const currentLang = localStorage.getItem('preferredLang') || 'en';

            if (zip.length === 5 && /^\d+$/.test(zip)) {
                zipMsg.textContent = translations[currentLang].validating_zip || 'Checking...';
                zipMsg.style.color = 'var(--text-light)';
                zipStatus.textContent = '⏳';

                try {
                    const response = await fetch(`https://api.zippopotam.us/se/${zip}`);
                    if (response.ok) {
                        const data = await response.json();
                        const apiCity = data.places[0]['place name'];

                        if (!cityInput.value.trim()) {
                            cityInput.value = apiCity;
                            zipMsg.textContent = '';
                            zipStatus.textContent = '✅';
                        } else if (cityInput.value.trim().toLowerCase() !== apiCity.toLowerCase()) {
                            zipMsg.textContent = translations[currentLang].zip_mismatch || 'Mismatch';
                            zipMsg.style.color = '#f59e0b';
                            zipStatus.textContent = '⚠️';
                        } else {
                            zipMsg.textContent = '';
                            zipStatus.textContent = '✅';
                        }
                    } else {
                        zipMsg.textContent = translations[currentLang].invalid_zip || 'Invalid Zip';
                        zipMsg.style.color = '#ef4444';
                        zipStatus.textContent = '❌';
                    }
                } catch (err) {
                    console.error('Zip API error:', err);
                    zipMsg.textContent = '';
                    zipStatus.textContent = '';
                }
            } else {
                zipMsg.textContent = '';
                zipStatus.textContent = '';
            }
        });

        cityInput.addEventListener('blur', () => {
            const zip = zipInput.value.replace(/\s/g, '');
            if (zip.length === 5) {
                zipInput.dispatchEvent(new Event('input'));
            }
        });

        // Email Validation
        const emailInput = document.getElementById('checkout-email');
        const emailStatus = document.getElementById('email-status');
        if (emailInput) {
            emailInput.addEventListener('input', () => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailInput.value.trim() === '') {
                    emailStatus.textContent = '';
                } else if (emailRegex.test(emailInput.value.trim())) {
                    emailStatus.textContent = '✅';
                } else {
                    emailStatus.textContent = '❌';
                }
            });
        }

        // Phone Validation
        const phoneInput = document.getElementById('checkout-phone');
        const phoneStatus = document.getElementById('phone-status');
        if (phoneInput) {
            phoneInput.addEventListener('input', () => {
                const phone = phoneInput.value.replace(/[\s-]/g, '');
                const phoneRegex = /^(\+?\d{8,15})$/;
                if (phone === '') {
                    phoneStatus.textContent = '';
                } else if (phoneRegex.test(phone)) {
                    phoneStatus.textContent = '✅';
                } else {
                    phoneStatus.textContent = '❌';
                }
            });
        }

        // Address Validation
        const addressInput = document.getElementById('checkout-address');
        const addressStatus = document.getElementById('address-status');
        if (addressInput) {
            addressInput.addEventListener('input', () => {
                const addr = addressInput.value.trim();
                const hasNumber = /\d/.test(addr);
                if (addr === '') {
                    addressStatus.textContent = '';
                } else if (addr.length >= 5 && hasNumber) {
                    addressStatus.textContent = '✅';
                } else {
                    addressStatus.textContent = '';
                }
            });
        }
    }
});
