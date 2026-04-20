/**
 * Dashboard Module
 */
const Dashboard = {
    /**
     * Initialize dashboard
     */
    async init() {
        // Wait for auth initialization before fetching dashboard data
        if (window.authInit) {
            const user = await window.authInit;
            if (!user) return; // Auth failed, will redirect anyway
        }

        console.log('Initializing Dashboard...');
        this.showLoading(true);
        
        try {
            const overview = await apiCall('/admin/overview');
            
            if (overview && overview.success) {
                this.renderStats(overview.stats);
                this.renderActivity(overview.recentActivity);
            } else {
                this.handleError(overview ? overview.message : 'Unable to connect to server');
            }
        } catch (error) {
            console.error('Dashboard Error:', error);
            this.handleError('An unexpected error occurred');
        } finally {
            this.showLoading(false);
        }
    },

    /**
     * Render statistics to the UI
     */
    renderStats(stats) {
        const elements = {
            totalUsers: document.getElementById('totalUsers'),
            totalPosts: document.getElementById('totalPosts'),
            totalSupport: document.getElementById('totalSupport')
        };

        if (elements.totalUsers) elements.totalUsers.textContent = (stats.totalUsers ?? 0).toLocaleString();
        if (elements.totalPosts) elements.totalPosts.textContent = (stats.totalPosts ?? 0).toLocaleString();
        if (elements.totalSupport) elements.totalSupport.textContent = (stats.openSupportRequests ?? 0).toLocaleString();
    },

    /**
     * Render recent activity list
     */
    renderActivity(activities) {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        if (!activities || activities.length === 0) {
            activityList.innerHTML = '<li class="empty-state">No recent activity found.</li>';
            return;
        }

        activityList.innerHTML = activities.map(activity => `
            <li>
                <div class="activity-item">
                    <strong>${this.escapeHtml(activity.label)}</strong>
                    <small>${this.formatDate(activity.created_at)}</small>
                </div>
            </li>
        `).join('');
    },

    /**
     * Helper to format date
     */
    formatDate(dateStr) {
        try {
            return new Date(dateStr).toLocaleString();
        } catch (e) {
            return dateStr;
        }
    },

    /**
     * Show or hide loading indicator
     */
    showLoading(isLoading) {
        const dashboardContent = document.querySelector('.dashboard-grid');
        if (dashboardContent) {
            dashboardContent.style.opacity = isLoading ? '0.5' : '1';
            dashboardContent.style.pointerEvents = isLoading ? 'none' : 'auto';
        }
    },

    /**
     * Handle and display errors
     */
    handleError(message) {
        console.error('Dashboard Data Error:', message);
        // Implement better UI for error if needed
        const activityList = document.getElementById('activityList');
        if (activityList) {
            activityList.innerHTML = `<li class="error-text">⚠️ ${this.escapeHtml(message)}</li>`;
        }
    },

    /**
     * Helper to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }
};

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
});
