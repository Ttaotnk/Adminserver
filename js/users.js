/**
 * Users Management Module
 */
const UserManagement = {
    allUsers: [],

    /**
     * Initialize the module
     */
    async init() {
        if (window.authInit) {
            const user = await window.authInit;
            if (!user) return;
        }

        this.bindEvents();
        await this.loadUsers();
    },

    /**
     * Bind UI events
     */
    bindEvents() {
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    },

    /**
     * Fetch users from API
     */
    async loadUsers() {
        this.showLoading(true);
        try {
            const data = await apiCall('/admin/users');
            if (data && data.success) {
                this.allUsers = data.items;
                this.renderUsers(this.allUsers);
            } else {
                this.renderError('Failed to load users: ' + (data ? data.message : 'Connection error'));
            }
        } catch (error) {
            console.error('User Load Error:', error);
            this.renderError('An unexpected error occurred while loading users.');
        } finally {
            this.showLoading(false);
        }
    },

    /**
     * Render user list to table
     */
    renderUsers(users) {
        const tableBody = document.getElementById('userTableBody');
        if (!tableBody) return;

        if (!users || users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No users found matching your search.</td></tr>';
            return;
        }

        tableBody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div class="user-avatar-wrapper">
                        <img src="${window.resolveImageUrl(user.profile_pic)}" 
                             class="user-pic" 
                             onerror="this.src='images/default-profile.png'"
                             alt="${this.escapeHtml(user.username)}">
                    </div>
                </td>
                <td>
                    <div class="user-info">
                        <strong class="user-name">${this.escapeHtml(user.username)}</strong>
                        <div class="user-id">ID: ${user._id}</div>
                    </div>
                </td>
                <td>${this.escapeHtml(user.email)}</td>
                <td class="text-center">
                    <span class="badge badge-info">${user.post_count || 0}</span>
                </td>
                <td class="text-center">
                    <span class="badge badge-secondary">${user.friend_count || 0}</span>
                </td>
                <td>${this.formatDate(user.created_at)}</td>
            </tr>
        `).join('');
    },

    /**
     * Filter users based on search term
     */
    handleSearch(term) {
        const query = term.toLowerCase().trim();
        if (!query) {
            this.renderUsers(this.allUsers);
            return;
        }

        const filtered = this.allUsers.filter(u => 
            (u.username && u.username.toLowerCase().includes(query)) || 
            (u.email && u.email.toLowerCase().includes(query)) || 
            (u._id && u._id.toLowerCase().includes(query))
        );
        this.renderUsers(filtered);
    },

    /**
     * Helper to format date
     */
    formatDate(dateStr) {
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch (e) {
            return dateStr || '-';
        }
    },

    /**
     * UI feedback helpers
     */
    showLoading(isLoading) {
        const table = document.querySelector('.table-responsive');
        if (table) table.style.opacity = isLoading ? '0.5' : '1';
    },

    renderError(message) {
        const tableBody = document.getElementById('userTableBody');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" class="error-text text-center">⚠️ ${this.escapeHtml(message)}</td></tr>`;
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
    UserManagement.init();
});
