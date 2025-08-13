const frontend = {
    // ... all original frontend methods EXCEPT ...

    handleBuySubmit: async function(e) {
        e.preventDefault();
        const serviceSelect = document.querySelector('#service-select');
        const price = parseFloat(serviceSelect.selectedOptions[0].dataset.price);
        
        // REAL 5SIM API CALL
        const response = await fetch(`https://5sim.net/v1/user/buy/activation/${country}/${operator}/${service}`, {
            headers: { 'Authorization': 'Bearer YOUR_5SIM_API_KEY' }
        });
        const data = await response.json();
        
        if(data.phone) {
            this.createActiveNumberCard(serviceSelect, data);
            showMessage(`Real number purchased: ${data.phone}`);
        }
    },

    // ... keep all other methods exactly the same ...
};if (!localStorage.getItem(DB_KEY)) saveData();

const sanitizeHTML = str => {
    if(!str) return "";
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};
const showMessage = (msg, type = 'success') => {
    const el = document.createElement('div');
    el.className = `wallet-notification ${type}`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => el.remove(), 500);
    }, 3000);
};
const applySeoSettings = () => {
    document.title = sanitizeHTML(db.seo.websiteTitle);
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
    }
    meta.content = sanitizeHTML(db.seo.websiteDescription);
};
const createRipple = (event) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - (button.getBoundingClientRect().left + radius)}px`;
    circle.style.top = `${event.clientY - (button.getBoundingClientRect().top + radius)}px`;
    circle.classList.add("ripple");
    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();
    button.appendChild(circle);
};

// ===== Frontend Logic =====
const frontend = {
    isInitialized: false,
    wallet: { balance: 19990, lifetimeRecharge: 1953.7, numbersPurchased: 203 },

    init: function() {
        if (this.isInitialized) return;
        this.attachOriginalEventListeners();
        this.isInitialized = true;
    },

    attachOriginalEventListeners: function() {
        const fe = this;
        const doc = document.getElementById('frontend-view');

        // Auth
        doc.querySelectorAll('.form-btn').forEach(btn => btn.addEventListener('click', fe.handleAuthSubmit.bind(fe)));
        doc.querySelectorAll('.form-toggle-buttons button, .form-link-text a').forEach(el =>
            el.addEventListener('click', (e) => {
                e.preventDefault();
                fe.switchAuthForm(el.id === 'register-toggle-btn' || e.target.textContent.includes('Sign Up') ? 'register' : 'login', e);
            })
        );
        doc.querySelectorAll('.eye-icon').forEach(icon => icon.addEventListener('click', () => fe.togglePassword(icon)));

        // Menu toggle
        doc.querySelector('#menu-toggle').addEventListener('click', e => {
            e.stopPropagation();
            doc.querySelector('#sidebar').classList.add('open');
            doc.querySelector('#overlay').classList.add('open');
        });
        doc.querySelector('#overlay').addEventListener('click', () => {
            doc.querySelector('#sidebar').classList.remove('open');
            doc.querySelector('#overlay').classList.remove('open');
        });

        // Navigation
        doc.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', e => {
            e.preventDefault();
            fe.showPage(item.dataset.page);
        }));
        doc.querySelectorAll('#home-page .action-button').forEach(btn =>
            btn.addEventListener('click', function() { if (this.dataset.page) fe.showPage(this.dataset.page); })
        );

        // Buy number
        doc.querySelector('#buy-number-form').addEventListener('submit', fe.handleBuySubmit.bind(fe));
        doc.querySelector('#server-select').addEventListener('change', e => fe.populateServices(parseInt(e.target.value)));

        // Recharge
        doc.querySelectorAll('.recharge-option').forEach(option =>
            option.addEventListener('click', function() {
                const method = this.dataset.method;
                const amountStr = prompt(`Enter amount for ${method}:`, "100");
                if (amountStr) {
                    const amount = parseFloat(amountStr);
                    if (!isNaN(amount) && amount > 0) {
                        fe.wallet.balance += amount;
                        fe.wallet.lifetimeRecharge += amount;
                        db.analytics.todaysPayment += amount;
                        saveData();
                        fe.updateDisplay();
                        showMessage(`Recharged ₹${amount.toFixed(2)}`, 'success');
                    }
                }
            })
        );
    },

    handleAuthSubmit: function(e) {
        e.preventDefault();
        const doc = document.getElementById('frontend-view');
        doc.querySelector('#loading-spinner').style.display = 'flex';
        setTimeout(() => {
            doc.querySelector('#login-section').style.display = 'none';
            doc.querySelector('#app-section').style.display = 'block';
            this.updateDisplay();
            this.populateServers();
            this.showPage('home-page');
            doc.querySelector('#loading-spinner').style.display = 'none';
        }, 1000);
    },

    switchAuthForm: (formType, event) => {
        if(event) event.preventDefault();
        const doc = document.getElementById('frontend-view');
        doc.querySelector('#login-form').classList.toggle('active', formType === 'login');
        doc.querySelector('#register-form').classList.toggle('active', formType === 'register');
        doc.querySelector('#login-toggle-btn').classList.toggle('active', formType === 'login');
        doc.querySelector('#register-toggle-btn').classList.toggle('active', formType === 'register');
    },

    togglePassword: (icon) => {
        const input = icon.previousElementSibling;
        input.type = input.type === 'password' ? 'text' : 'password';
    },

    showPage: function(pageId) {
        if (!pageId) return;
        const doc = document.getElementById('frontend-view');
        doc.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
        doc.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        const page = doc.querySelector(`#${pageId}`);
        if(page) page.classList.add('active');
        const navItem = doc.querySelector(`.nav-item[data-page="${pageId}"]`);
        if(navItem) navItem.classList.add('active');
        doc.querySelector('#sidebar').classList.remove('open');
        doc.querySelector('#overlay').classList.remove('open');
    },

    updateDisplay: function() {
        const doc = document.getElementById('frontend-view');
        if(!doc.querySelector('#wallet-balance-value')) return;
        doc.querySelector('#wallet-balance-value').textContent = this.wallet.balance.toFixed(2);
        doc.querySelector('#wallet-card-value').textContent = '₹' + this.wallet.balance.toFixed(2);
        doc.querySelector('#lifetime-recharge-value').textContent = this.wallet.lifetimeRecharge.toFixed(2);
        doc.querySelector('#numbers-purchased-value').textContent = this.wallet.numbersPurchased;
    },

    populateServers: function() {
        const select = document.querySelector('#server-select');
        select.innerHTML = '';
        db.servers.forEach(s =>
            select.insertAdjacentHTML('beforeend', `<option value="${s.id}" data-country="${s.serverCountryCode}">${sanitizeHTML(s.serverName)}</option>`)
        );
        if (db.servers.length > 0) select.dispatchEvent(new Event('change'));
    },

    populateServices: function(serverId) {
        const select = document.querySelector('#service-select');
        select.innerHTML = '';
        const services = db.services.filter(s => s.serverId === serverId);
        const countryCode = db.servers.find(s => s.id === serverId)?.serverCountryCode || 'in';
        document.querySelector('#server-flag-img').src = `https://flagcdn.com/${countryCode}.svg`;
        if (services.length === 0) {
            select.innerHTML = `<option disabled>No services available</option>`;
            return;
        }
        services.forEach(s =>
            select.insertAdjacentHTML('beforeend', `<option value="${s.serviceCode}" data-price="${s.servicePrice}" data-country="${s.country}" data-operator="${s.operator}">${sanitizeHTML(s.serviceName)} - ₹${s.servicePrice}</option>`)
        );
    },

    handleBuySubmit: async function(e) {
        e.preventDefault();
        const serviceSelect = document.querySelector('#service-select');
        if (!serviceSelect.options || serviceSelect.selectedIndex < 0) {
            showMessage('Please select a service.', 'error');
            return;
        }
        const selectedServiceOption = serviceSelect.options[serviceSelect.selectedIndex];
        const price = parseFloat(selectedServiceOption.dataset.price);
        if (this.wallet.balance < price) {
            showMessage('Insufficient balance!', 'error');
            return;
        }
        const serverId = parseInt(document.querySelector('#server-select').value);
        const server = db.servers.find(s => s.id === serverId);
        const service = db.services.find(s => s.serviceCode === selectedServiceOption.value && s.serverId === serverId);
        if (!server || !server.apiGetNumberUrl || !server.apiKey) {
            showMessage('Server is not configured correctly for API calls!', 'error');
            return;
        }
        showMessage('Requesting number...', 'info');
        try {
            const url = `${server.apiGetNumberUrl}/${service.country}/${service.operator}/${service.serviceCode}`;
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${server.apiKey}` } });
            const data = await response.json();
            if (data.id && data.phone) {
                this.wallet.balance -= price;
                this.wallet.numbersPurchased++;
                db.analytics.todaysOrders++;
                saveData();
                this.updateDisplay();
                showMessage(`Number acquired: ${data.phone}`, 'success');
                this.createActiveNumberCard(selectedServiceOption, data);
            } else {
                throw new Error(data.message || 'Could not purchase number.');
            }
        } catch (error) {
            console.error("Buy Error:", error);
            showMessage(`Error: ${error.message}`, 'error');
        }
    },

    startTimer: function(cardElement) {
        const timerDisplay = cardElement.querySelector('.timer span');
        const statusText = cardElement.querySelector('.status-text');
        let duration = 10 * 60; // 10 minutes
        const orderId = cardElement.dataset.orderId;
        const serverId = parseInt(cardElement.dataset.serverId);
        const server = db.servers.find(s => s.id === serverId);
        const otpCheckInterval = setInterval(async () => {
            try {
                const response = await fetch(`${server.apiGetMessageUrl}/${orderId}`, { headers: { 'Authorization': `Bearer ${server.apiKey}` } });
                const data = await response.json();
                if (data.status === 'RECEIVED' && data.sms && data.sms.length > 0) {
                    statusText.innerHTML = `<strong class="otp-code">${sanitizeHTML(data.sms[0].code)}</strong>`;
                    cardElement.dataset.otpRevealed = "true";
                    clearInterval(otpCheckInterval);
                    clearInterval(timerInterval);
                } else if (data.status === 'CANCELED') {
                    clearInterval(otpCheckInterval);
                    clearInterval(timerInterval);
                    statusText.textContent = "Order Canceled";
                }
            } catch (error) {
                console.error("OTP Check Error:", error);
            }
        }, 10000);
        const timerInterval = setInterval(() => {
            let minutes = parseInt(duration / 60, 10);
            let seconds = parseInt(duration % 60, 10);
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            timerDisplay.textContent = minutes + ":" + seconds;
            if (--duration < 0) {
                clearInterval(timerInterval);
                clearInterval(otpCheckInterval);
                if (cardElement.dataset.otpRevealed === "false") {
                    statusText.textContent = "Time expired";
                    this.cancelNumber(cardElement, true);
                }
            }
        }, 1000);
        cardElement.dataset.timerIntervalId = timerInterval;
        cardElement.dataset.otpIntervalId = otpCheckInterval;
    },

    createActiveNumberCard: function(serviceOption, apiData) {
        const doc = document.getElementById('frontend-view');
        doc.querySelector('#no-active-number-info').style.display = 'none';
        const template = doc.querySelector('#active-number-template');
        const newCard = template.cloneNode(true);
        newCard.removeAttribute('id');
        newCard.style.display = 'block';
        const serverId = parseInt(doc.querySelector('#server-select').value);
        newCard.dataset.orderId = apiData.id;
        newCard.dataset.serverId = serverId;
        newCard.dataset.price = apiData.price;
        newCard.dataset.serviceName = serviceOption.text;
        newCard.dataset.otpRevealed = "false";
        newCard.querySelector('.service-icon').textContent = serviceOption.value.substring(0, 3).toUpperCase();
        newCard.querySelector('.number').textContent = sanitizeHTML(apiData.phone);
        newCard.querySelector('.service-name').textContent = sanitizeHTML(serviceOption.text);
        newCard.querySelector('.copy-icon').addEventListener('click', () => navigator.clipboard.writeText(apiData.phone).then(() => showMessage('Number copied!', 'success')));
        newCard.querySelector('.btn-cancel').addEventListener('click', () => this.cancelNumber(newCard));
        newCard.querySelector('.btn-next').addEventListener('click', () => this.banNumber(newCard));
        doc.querySelector('#active-numbers-container').appendChild(newCard);
        this.startTimer(newCard);
    },

    cancelNumber: async function(cardElement, isAutoCancel = false) {
        if (cardElement.dataset.otpRevealed === "true") {
            if(!isAutoCancel) showMessage('Cannot cancel, OTP was received.', 'error');
            return;
        }
        const orderId = cardElement.dataset.orderId;
        const serverId = parseInt(cardElement.dataset.serverId);
        const server = db.servers.find(s => s.id === serverId);
        try {
            const response = await fetch(`${server.apiCancelUrl}/${orderId}`, { headers: { 'Authorization': `Bearer ${server.apiKey}` } });
            const data = await response.json();
            if (data.status === 'success' || response.ok) {
                const price = parseFloat(cardElement.dataset.price);
                this.wallet.balance += price;
                this.wallet.numbersPurchased--;
                db.analytics.todaysOrders--;
                saveData();
                this.updateDisplay();
                showMessage(`Order ${orderId} canceled. ₹${price.toFixed(2)} refunded.`, 'success');
            } else { throw new Error('API could not cancel order.'); }
        } catch(error) {
            if(!isAutoCancel) showMessage(error.message, 'error');
        } finally {
            clearInterval(cardElement.dataset.timerIntervalId);
            clearInterval(cardElement.dataset.otpIntervalId);
            cardElement.remove();
            if (document.querySelector('#active-numbers-container').childElementCount === 0)
                document.querySelector('#no-active-number-info').style.display = 'block';
        }
    },

    banNumber: async function(cardElement) {
        const orderId = cardElement.dataset.orderId;
        const serverId = parseInt(cardElement.dataset.serverId);
        const server = db.servers.find(s => s.id === serverId);
        try {
            const response = await fetch(`${server.apiBanUrl}/${orderId}`, { headers: { 'Authorization': `Bearer ${server.apiKey}` } });
            if (response.ok) { showMessage(`Order ${orderId} marked as used.`, 'info'); }
            else { throw new Error('Could not mark number as used.'); }
        } catch(error) { showMessage(error.message, 'error'); }
        finally {
            clearInterval(cardElement.dataset.timerIntervalId);
            clearInterval(cardElement.dataset.otpIntervalId);
            cardElement.remove();
            if (document.querySelector('#active-numbers-container').childElementCount === 0)
                document.querySelector('#no-active-number-info').style.display = 'block';
        }
    }
};

// Apply SEO and init
applySeoSettings();
frontend.init();
document.addEventListener('mousedown', e => {
    if (e.target.matches('.btn-buy, .btn-footer, .action-button, .form-btn, .recharge-option, .install-button'))
        createRipple(e);
});
