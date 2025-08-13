// ===== Admin Panel Logic =====
const adminPanel = {
    isInitialized: false,

    init: function() {
        if (this.isInitialized) return;
        this.attachOriginalEventListeners();
        this.isInitialized = true;
    },

    attachOriginalEventListeners: function() {
        const ap = this;
        const doc = document.getElementById('admin-panel');

        // Navigation
        doc.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', () => {
            doc.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            doc.querySelector(`#${item.dataset.page}`).classList.add('active');
            doc.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        }));

        // Back buttons
        doc.querySelectorAll('.back-btn').forEach(btn => btn.addEventListener('click', () => {
            doc.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            doc.querySelector('#dashboard').classList.add('active');
        }));

        // Add Server Form
        doc.querySelector('#add-server-form')?.addEventListener('submit', function(e) {
            e.preventDefault();
            const serverName = doc.querySelector('#server-name').value.trim();
            const countryCode = doc.querySelector('#server-country-code').value.trim().toLowerCase();
            const apiKey = doc.querySelector('#server-api-key').value.trim();
            const getNumberUrl = doc.querySelector('#server-getnumber-url').value.trim();
            const getMessageUrl = doc.querySelector('#server-getmessage-url').value.trim();
            const cancelUrl = doc.querySelector('#server-cancel-url').value.trim();
            const banUrl = doc.querySelector('#server-ban-url').value.trim();
            if (!serverName || !countryCode || !apiKey || !getNumberUrl || !getMessageUrl || !cancelUrl || !banUrl) {
                showMessage('Please fill all server fields', 'error');
                return;
            }
            const newServer = {
                id: Date.now(),
                serverName,
                serverCountryCode: countryCode,
                apiKey,
                apiGetNumberUrl: getNumberUrl,
                apiGetMessageUrl: getMessageUrl,
                apiCancelUrl: cancelUrl,
                apiBanUrl: banUrl
            };
            db.servers.push(newServer);
            saveData();
            showMessage(`Server "${serverName}" added successfully!`, 'success');
            this.reset();
        });

        // Add Service Form
        doc.querySelector('#add-service-form')?.addEventListener('submit', function(e) {
            e.preventDefault();
            const serverId = parseInt(doc.querySelector('#service-server-id').value);
            const serviceName = doc.querySelector('#service-name').value.trim();
            const servicePrice = doc.querySelector('#service-price').value.trim();
            const serviceCode = doc.querySelector('#service-code').value.trim();
            const country = doc.querySelector('#service-country').value.trim().toLowerCase();
            const operator = doc.querySelector('#service-operator').value.trim().toLowerCase();
            if (!serverId || !serviceName || !servicePrice || !serviceCode || !country || !operator) {
                showMessage('Please fill all service fields', 'error');
                return;
            }
            const newService = {
                id: Date.now(),
                serverId,
                serviceName,
                servicePrice,
                serviceCode,
                country,
                operator
            };
            db.services.push(newService);
            saveData();
            showMessage(`Service "${serviceName}" added successfully!`, 'success');
            this.reset();
        });
    },

    updateAnalyticsDisplay: function() {
        const doc = document.getElementById('admin-panel');
        if (!doc.querySelector('#todays-users')) return;
        doc.querySelector('#todays-users').textContent = db.analytics.todaysUsers;
        doc.querySelector('#total-users').textContent = db.analytics.totalUsers;
        doc.querySelector('#todays-orders').textContent = db.analytics.todaysOrders;
        doc.querySelector('#todays-payment').textContent = db.analytics.todaysPayment.toFixed(2);
    }
};

// Init admin panel
adminPanel.init();
document.addEventListener('mousedown', e => {
    if (e.target.matches('#admin-panel .btn-save, #admin-panel .nav-item, #admin-panel .btn-edit, #admin-panel .btn-edit-save, #admin-panel .list-item, #admin-panel .tab, #admin-panel .back-btn'))
        createRipple(e);
});    },
    
    init: function() {
        if(this.isInitialized) { this.renderLists(); this.updateAnalyticsDisplay(); this.showPage('page-users'); return; }
        
        const adminPanelView = document.getElementById('admin-panel');
        const checkAndAttach = () => {
            if(!adminPanelView.querySelector('.bottom-nav')) {
                setTimeout(checkAndAttach, 100);
                return;
            }
            adminPanelView.querySelectorAll('.bottom-nav .nav-item').forEach(nav => nav.addEventListener('click', () => { adminPanelView.querySelectorAll('.bottom-nav .nav-item').forEach(i => i.classList.remove('active')); nav.classList.add('active'); this.showPage(nav.dataset.page); }));
            const pageNav = {'add-server-btn': 'page-add-server', 'add-service-btn': 'page-add-service', 'analytics-btn': 'page-analytics', 'seo-btn': 'page-seo', 'settings-btn':'page-settings', 'back-to-services-btn': 'page-services', 'back-to-services-from-add-service-btn': 'page-services', 'back-to-menu-from-analytics-btn': 'page-menu', 'back-to-menu-from-seo-btn': 'page-menu', 'back-to-menu-from-settings-btn': 'page-menu'};
            Object.entries(pageNav).forEach(([btnId, pageId]) => adminPanelView.querySelector(`#${btnId}`)?.addEventListener('click', e => { e.preventDefault(); this.showPage(pageId); }));
            ['accounts-btn', 'theme-btn', 'payment-btn', 'notifications-btn', 'footer-btn', 'logout-btn', 'direct-import-btn'].forEach(id => adminPanelView.querySelector(`#${id}`)?.addEventListener('click', e => {e.preventDefault(); alert('Functionality not implemented.')}));
            adminPanelView.querySelectorAll('.service-filter-tabs .tab').forEach(t => t.addEventListener('click', () => { adminPanelView.querySelectorAll('.service-filter-tabs .tab').forEach(i=>i.classList.remove('active')); t.classList.add('active'); this.renderLists(); }));
            
            adminPanelView.querySelector('#add-server-form').addEventListener('submit', e => { 
                e.preventDefault(); 
                const fd = new FormData(e.target); 
                const newServer = { id: Date.now() }; 
                fd.forEach((value, key) => newServer[key] = value); 
                db.servers.push(newServer); 
                saveData(); 
                showMessage('Server added!'); 
                e.target.reset(); 
                this.renderLists(); 
                this.showPage('page-services'); 
            });
            
            adminPanelView.querySelector('#add-service-btn').addEventListener('click', () => { 
                const select = adminPanelView.querySelector('#add-service-form select[name="serverId"]'); 
                select.innerHTML = '<option value="">Select Server</option>'; 
                db.servers.forEach(s => select.insertAdjacentHTML('beforeend', `<option value="${s.id}">${sanitizeHTML(s.serverName)}</option>`)); 
            });
            
            adminPanelView.querySelector('#add-service-form').addEventListener('submit', e => { 
                e.preventDefault(); 
                const fd = new FormData(e.target); 
                const newService = { id: Date.now() }; 
                fd.forEach((value, key) => newService[key] = value); 
                db.services.push(newService); 
                saveData(); 
                showMessage('Service added!'); 
                e.target.reset(); 
                this.renderLists(); 
                this.showPage('page-services'); 
            });
            
            adminPanelView.querySelector('#seo-btn').addEventListener('click', () => {
                adminPanelView.querySelector('#seo-form [name="websiteTitle"]').value = db.seo.websiteTitle;
                adminPanelView.querySelector('#seo-form [name="websiteDescription"]').value = db.seo.websiteDescription;
            });
    
            adminPanelView.querySelector('#seo-form').addEventListener('submit', e => { 
                e.preventDefault(); 
                const fd = new FormData(e.target); 
                db.seo.websiteTitle = fd.get('websiteTitle'); 
                db.seo.websiteDescription = fd.get('websiteDescription'); 
                saveData(); 
                applySeoSettings(); 
                showMessage('SEO settings saved!'); 
                this.showPage('page-menu'); 
            });
            
            adminPanelView.querySelector('#settings-form, #meta-tag-form').addEventListener('submit', e => { e.preventDefault(); alert('Saved (demo)!'); });
            adminPanelView.querySelectorAll('.keyword-tag .remove-tag').forEach(el => el.addEventListener('click', () => el.parentElement.remove()));
            
            this.isInitialized = true; 
            this.showPage('page-users'); 
            this.renderLists(); 
            this.updateAnalyticsDisplay();
        };
        checkAndAttach();
    }
};
