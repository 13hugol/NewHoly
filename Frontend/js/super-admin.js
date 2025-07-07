// Super Admin Panel JavaScript
class SuperAdminPanel {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('superAdminToken');
        this.apiBase = '/api/super-admin';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => this.switchPage(item.dataset.page));
        });
        
        // Add organization buttons
        document.getElementById('addOrgBtn')?.addEventListener('click', () => this.showAddOrgModal());
        document.getElementById('addOrgBtn2')?.addEventListener('click', () => this.showAddOrgModal());
        
        // Add organization form
        document.getElementById('addOrgForm')?.addEventListener('submit', (e) => this.handleAddOrganization(e));
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });
        
        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
        
        // Refresh button
        document.getElementById('refreshBtn')?.addEventListener('click', () => this.refreshCurrentPage());
        
        // User filters
        document.getElementById('userFilterRole')?.addEventListener('change', () => this.loadUsers());
        document.getElementById('userFilterOrg')?.addEventListener('change', () => this.loadUsers());
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }

    async checkAuth() {
        if (!this.token) {
            this.showLogin();
            return;
        }

        try {
            // Verify token by making a test request
            const response = await this.apiCall('/dashboard');
            if (response.ok) {
                this.showDashboard();
                this.loadDashboardData();
            } else {
                this.showLogin();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showLogin();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        this.showLoading(true);

        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok) {
                this.token = result.token;
                localStorage.setItem('superAdminToken', this.token);
                this.showDashboard();
                this.loadDashboardData();
                this.showNotification('Login successful!', 'success');
            } else {
                this.showNotification(result.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    logout() {
        localStorage.removeItem('superAdminToken');
        this.token = null;
        this.currentUser = null;
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('userInfo').textContent = 'Super Administrator';
    }

    switchPage(pageId) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
        
        // Update pages
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(`${pageId}Page`).classList.add('active');
        
        // Load page data
        this.loadPageData(pageId);
    }

    async loadPageData(pageId) {
        switch (pageId) {
            case 'overview':
                await this.loadDashboardData();
                break;
            case 'organizations':
                await this.loadOrganizations();
                break;
            case 'users':
                await this.loadUsers();
                break;
            case 'analytics':
                // Load analytics data
                break;
            case 'settings':
                // Load settings
                break;
        }
    }

    async refreshCurrentPage() {
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            const pageId = activePage.id.replace('Page', '');
            await this.loadPageData(pageId);
        }
        this.showNotification('Data refreshed', 'success');
    }

    async loadDashboardData() {
        try {
            this.showLoading(true);
            const data = await this.apiCall('/dashboard');
            
            if (data.overview) {
                // Update stats cards
                document.getElementById('totalOrgs').textContent = data.overview.totalOrganizations;
                document.getElementById('activeOrgs').textContent = data.overview.activeOrganizations;
                document.getElementById('totalUsers').textContent = data.overview.totalUsers;
                document.getElementById('revenue').textContent = '$0'; // Calculate based on subscriptions
                
                // Update recent organizations
                this.renderRecentOrganizations(data.recentOrganizations || []);
                
                // Update recent users
                this.renderRecentUsers(data.recentUsers || []);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadOrganizations() {
        try {
            this.showLoading(true);
            const data = await this.apiCall('/organizations');
            this.renderOrganizationsTable(data.data || []);
        } catch (error) {
            console.error('Failed to load organizations:', error);
            this.showNotification('Failed to load organizations', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadUsers() {
        try {
            this.showLoading(true);
            const role = document.getElementById('userFilterRole')?.value || '';
            const organizationId = document.getElementById('userFilterOrg')?.value || '';
            
            let url = '/users?';
            if (role) url += `role=${role}&`;
            if (organizationId) url += `organizationId=${organizationId}&`;
            
            const data = await this.apiCall(url);
            this.renderUsersTable(data.data || []);
            
            // Update organization filter if not populated
            if (!document.getElementById('userFilterOrg').innerHTML.includes('option')) {
                this.populateOrganizationFilter();
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            this.showNotification('Failed to load users', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderRecentOrganizations(organizations) {
        const container = document.getElementById('recentOrgs');
        if (!container) return;

        container.innerHTML = organizations.map(org => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-building"></i>
                </div>
                <div class="activity-content">
                    <h4>${org.name}</h4>
                    <p>Created ${this.formatDate(org.createdAt)}</p>
                </div>
            </div>
        `).join('');
    }

    renderRecentUsers(users) {
        const container = document.getElementById('recentUsers');
        if (!container) return;

        container.innerHTML = users.map(user => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-user"></i>
                </div>
                <div class="activity-content">
                    <h4>${user.profile?.name || user.email}</h4>
                    <p>${user.role} • ${this.formatDate(user.createdAt)}</p>
                </div>
            </div>
        `).join('');
    }

    renderOrganizationsTable(organizations) {
        const tbody = document.querySelector('#organizationsTable tbody');
        if (!tbody) return;

        tbody.innerHTML = organizations.map(org => `
            <tr>
                <td>${org.name}</td>
                <td>${org.domain || '-'}</td>
                <td>
                    <span class="status-badge status-${org.subscription?.plan}">
                        ${org.subscription?.plan?.toUpperCase() || 'BASIC'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${org.subscription?.status === 'active' ? 'status-active' : 'status-inactive'}">
                        ${org.subscription?.status?.toUpperCase() || 'INACTIVE'}
                    </span>
                </td>
                <td>${this.formatDate(org.createdAt)}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="superAdmin.viewOrganization('${org.organizationId}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-small btn-warning" onclick="superAdmin.editOrganization('${org.organizationId}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderUsersTable(users) {
        const tbody = document.querySelector('#usersTable tbody');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.profile?.name || '-'}</td>
                <td>${user.email}</td>
                <td>
                    <span class="status-badge status-${user.role}">
                        ${user.role?.replace('_', ' ').toUpperCase()}
                    </span>
                </td>
                <td>${user.organizationId || 'System'}</td>
                <td>
                    <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
                        ${user.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                </td>
                <td>${user.lastLogin ? this.formatDate(user.lastLogin) : 'Never'}</td>
                <td>
                    <button class="btn btn-small btn-warning" onclick="superAdmin.toggleUserStatus('${user._id}')">
                        <i class="fas fa-power-off"></i> Toggle
                    </button>
                    <button class="btn btn-small btn-danger" onclick="superAdmin.deleteUser('${user._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async populateOrganizationFilter() {
        try {
            const data = await this.apiCall('/organizations');
            const select = document.getElementById('userFilterOrg');
            if (!select) return;

            const currentValue = select.value;
            select.innerHTML = '<option value="">All Organizations</option>' + 
                (data.data || []).map(org => 
                    `<option value="${org.organizationId}">${org.name}</option>`
                ).join('');
            select.value = currentValue;
        } catch (error) {
            console.error('Failed to populate organization filter:', error);
        }
    }

    showAddOrgModal() {
        document.getElementById('addOrgModal').classList.add('active');
    }

    closeModal(modal) {
        modal.classList.remove('active');
    }

    async handleAddOrganization(e) {
        e.preventDefault();
        this.showLoading(true);

        const formData = new FormData(e.target);
        const orgData = {
            name: formData.get('name'),
            domain: formData.get('domain'),
            plan: formData.get('plan'),
            adminEmail: formData.get('adminEmail'),
            adminPassword: formData.get('adminPassword'),
            adminName: formData.get('adminName')
        };

        try {
            const result = await this.apiCall('/organizations', {
                method: 'POST',
                body: JSON.stringify(orgData)
            });

            if (result.success) {
                this.showNotification('Organization created successfully!', 'success');
                this.closeModal(document.getElementById('addOrgModal'));
                e.target.reset();
                this.loadOrganizations();
                this.loadDashboardData();
            } else {
                this.showNotification(result.message || 'Failed to create organization', 'error');
            }
        } catch (error) {
            console.error('Failed to create organization:', error);
            this.showNotification('Failed to create organization', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async viewOrganization(orgId) {
        try {
            const data = await this.apiCall(`/organizations/${orgId}`);
            this.showOrganizationDetails(data);
        } catch (error) {
            console.error('Failed to load organization details:', error);
            this.showNotification('Failed to load organization details', 'error');
        }
    }

    showOrganizationDetails(data) {
        // Create and show organization details modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2><i class="fas fa-building"></i> ${data.data.name}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div style="padding: 24px;">
                    <div class="form-grid">
                        <div><strong>Organization ID:</strong> ${data.data.organizationId}</div>
                        <div><strong>Domain:</strong> ${data.data.domain || 'Not set'}</div>
                        <div><strong>Plan:</strong> ${data.data.subscription?.plan || 'Basic'}</div>
                        <div><strong>Status:</strong> ${data.data.subscription?.status || 'Inactive'}</div>
                        <div><strong>Created:</strong> ${this.formatDate(data.data.createdAt)}</div>
                        <div><strong>Users:</strong> ${data.users?.length || 0}</div>
                    </div>
                    <h3 style="margin: 24px 0 16px 0;">Users in this Organization:</h3>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                ${(data.users || []).map(user => `
                                    <tr>
                                        <td>${user.profile?.name || '-'}</td>
                                        <td>${user.email}</td>
                                        <td>${user.role}</td>
                                        <td><span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">${user.isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    async toggleUserStatus(userId) {
        if (!confirm('Are you sure you want to toggle this user\'s status?')) return;

        try {
            const result = await this.apiCall(`/users/${userId}/toggle-status`, {
                method: 'PUT'
            });

            if (result.success) {
                this.showNotification('User status updated successfully!', 'success');
                this.loadUsers();
            } else {
                this.showNotification(result.message || 'Failed to update user status', 'error');
            }
        } catch (error) {
            console.error('Failed to toggle user status:', error);
            this.showNotification('Failed to update user status', 'error');
        }
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const result = await this.apiCall(`/users/${userId}`, {
                method: 'DELETE'
            });

            if (result.success) {
                this.showNotification('User deleted successfully!', 'success');
                this.loadUsers();
                this.loadDashboardData();
            } else {
                this.showNotification(result.message || 'Failed to delete user', 'error');
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            this.showNotification('Failed to delete user', 'error');
        }
    }

    async apiCall(endpoint, options = {}) {
        const url = this.apiBase + endpoint;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        };

        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            if (response.status === 401) {
                this.logout();
                throw new Error('Authentication failed');
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('active', show);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        // Set background color based on type
        const colors = {
            success: '#059669',
            error: '#dc2626',
            warning: '#d97706',
            info: '#0284c7'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Initialize Super Admin Panel
const superAdmin = new SuperAdminPanel();
