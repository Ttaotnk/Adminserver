/**
 * Support Management Module
 */
const SupportManagement = {
    allRequests: [],

    /**
     * Initialize the module
     */
    async init() {
        if (window.authInit) {
            const user = await window.authInit;
            if (!user) return;
        }

        this.bindEvents();
        await this.loadRequests();
    },

    /**
     * Bind UI events
     */
    bindEvents() {
        const searchInput = document.getElementById('supportSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    },

    /**
     * Fetch support requests from API
     */
    async loadRequests() {
        this.showLoading(true);
        try {
            const data = await apiCall('/admin/support-requests');
            if (data && data.success) {
                this.allRequests = data.items;
                this.renderRequests(this.allRequests);
            } else {
                this.renderError('Failed to load support requests: ' + (data ? data.message : 'Connection error'));
            }
        } catch (error) {
            console.error('Support Load Error:', error);
            this.renderError('An unexpected error occurred while loading requests.');
        } finally {
            this.showLoading(false);
        }
    },

    /**
     * Render support requests as cards
     */
    renderRequests(requests) {
        const listContainer = document.getElementById('supportRequestsList');
        if (!listContainer) return;

        if (!requests || requests.length === 0) {
            listContainer.innerHTML = '<div class="empty-state text-center">No support requests found matching your search.</div>';
            return;
        }

        listContainer.innerHTML = requests.map(req => `
            <div class="request-card">
                <div class="request-header">
                    <div class="request-main-info">
                        <h3 class="request-title">${this.escapeHtml(req.title)}</h3>
                        <p class="request-message">${this.escapeHtml(req.message)}</p>
                    </div>
                    <span class="status-badge status-${req.status}">${this.escapeHtml(req.status || 'unknown').toUpperCase()}</span>
                </div>
                <div class="request-footer">
                    <div class="user-meta">
                        <span class="meta-item">👤 <strong>User:</strong> ${this.escapeHtml(req.username || 'Unknown')}</span>
                        <span class="meta-item meta-id">ID: ${req.user_id || 'N/A'}</span>
                    </div>
                    <div class="time-meta">
                        <span>📅 ${this.formatDate(req.created_at)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Helper to format date
     */
    formatDate(dateStr) {
        try {
            return new Date(dateStr).toLocaleString();
        } catch (e) {
            return dateStr || '-';
        }
    },

    /**
     * Filter requests based on search term
     */
    handleSearch(term) {
        const query = term.toLowerCase().trim();
        if (!query) {
            this.renderRequests(this.allRequests);
            return;
        }

        const filtered = this.allRequests.filter(r => 
            (r.username && r.username.toLowerCase().includes(query)) || 
            (r.title && r.title.toLowerCase().includes(query)) || 
            (r.message && r.message.toLowerCase().includes(query)) ||
            (r.user_id && r.user_id.toLowerCase().includes(query))
        );
        this.renderRequests(filtered);
    },

    /**
     * UI feedback helpers
     */
    showLoading(isLoading) {
        const container = document.getElementById('supportRequestsList');
        if (container) container.style.opacity = isLoading ? '0.5' : '1';
    },

    renderError(message) {
        const container = document.getElementById('supportRequestsList');
        if (container) {
            container.innerHTML = `<div class="error-text text-center">⚠️ ${this.escapeHtml(message)}</div>`;
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    SupportManagement.init();
});
