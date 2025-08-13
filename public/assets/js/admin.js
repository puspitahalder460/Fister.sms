// =================================================================
// ADMIN PANEL LOGIC
// =================================================================
const adminPanel = {
    isInitialized: false,
    
    showPage: function(pageId) {
        const adminPanelView = document.getElementById('admin-panel');
        adminPanelView.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const page = adminPanelView.querySelector(`#${pageId}`);
        if (page) page.classList.add('active');
    },
    
    renderLists: function() {
        const adminPanelView = document.getElementById('admin-panel');
        const container = adminPanelView.querySelector('#services-list-container');
        const activeTab = adminPanelView.querySelector('.service-filter-tabs .tab.active').dataset.type;
        container.innerHTML = '';
        if (activeTab === 'servers') {
            if (db.servers.length === 0) container.innerHTML = `<div class="empty-state"><img src="https://i.imgur.com/gK5z2J6.png" alt="No servers"><p>No servers found.</p></div>`;
            else db.servers.forEach(s => container.insertAdjacentHTML('beforeend', `<div class="card list-item"><div class="info"><div class="icon-bg icon-bg-blue"><img src="https://api.iconify.design/solar:server-square-cloud-bold-duotone.svg"></div><div class="details"><div class="title">${sanitizeHTML(s.serverName)}</div><div class="subtitle">ID: ${s.id} | Country: ${sanitizeHTML(s.serverCountryCode.toUpperCase())}</div></div></div><img src="https://api.iconify.design/solar:alt-arrow-right-linear.svg" class="arrow-icon"></div>`));
        } else {
            if (db.services.length === 0) container.innerHTML = `<div class="empty-state"><img src="https://i.imgur.com/gK5z2J6.png" alt="No services"><p>No services found.</p></div>`;
            else db.services.forEach(s => container.insertAdjacentHTML('beforeend', `<div class="card list-item"><div class="info"><div class="icon-bg icon-bg-green"><img src="https://api.iconify.design/solar:document-add-bold-duotone.svg"></div><div class="details"><div class="title">${sanitizeHTML(s.serviceName)}</div><div class="subtitle">${sanitizeHTML(db.servers.find(srv => srv.id === s.serverId)?.serverName || 'N/A')} | Price: ₹${s.servicePrice}</div></div></div><img src="https://api.iconify.design/solar:alt-arrow-right-linear.svg" class="arrow-icon"></div>`));
        }
    },
    
    updateAnalyticsDisplay: function() {
        const adminPanelView = document.getElementById('admin-panel');
        const page = adminPanelView.querySelector('#page-analytics'); if (!page) return;
        page.querySelector('.stat-card .icon-box.users').closest('.card').querySelector('.main-stat').textContent = db.analytics.todaysUsers;
        page.querySelector('.stat-card .icon-box.users').closest('.card').querySelector('.sub-stat').textContent = `${db.analytics.totalUsers} Total Users`;
        page.querySelector('.stat-card .icon-box.orders').closest('.card').querySelector('.main-stat').textContent = db.analytics.todaysOrders;
        page.querySelector('.stat-card .icon-box.orders').closest('.card').querySelector('.sub-stat').textContent = `${frontend.wallet.numbersPurchased} Total Numbers Bought`;
        page.querySelector('.stat-card .icon-box.payment').closest('.card').querySelector('.main-stat').textContent = `₹${db.analytics.todaysPayment.toFixed(2)}`;
        page.querySelector('.stat-card .icon-box.payment').closest('.card').querySelector('.sub-stat').textContent = `₹${frontend.wallet.lifetimeRecharge.toFixed(2)} Total Payment Received`;
    },
    
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
