/**
 * LaoVerse Admin Authentication Module
 */
const Auth = {
    user: null,
    initialized: false,
    initPromise: null,

    /**
     * Initialize auth - returns a promise that resolves when auth is checked
     */
    async init() {
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            const token = localStorage.getItem('laoverse_jwt');
            const path = window.location.pathname.toLowerCase();
            // Check for login page more robustly (works with /login, /login.html, or /admin/login)
            const isLoginPage = path.includes('login');

            if (!token) {
                if (!isLoginPage) {
                    window.location.href = 'login.html';
                }
                this.initialized = true;
                return null;
            }

            try {
                // Verify token and get user role/info
                const data = await apiCall('/check_auth');

                if (data && data.success) {
                    this.user = data.user;
                    
                    // Security Check: Verify Admin Role
                    if (this.user.role !== 'admin') {
                        console.error('Unauthorized access attempt: Not an admin');
                        alert('ຂໍອະໄພ: ທ່ານບໍ່ມີສິດເຂົ້າເຖິງລະບົບແອດມິນ');
                        this.logout();
                        return null;
                    }

                    if (isLoginPage) {
                        window.location.href = 'index.html';
                    } else {
                        this.updateUI();
                    }
                    
                    this.initialized = true;
                    return this.user;
                } else {
                    if (!isLoginPage) {
                        this.logout();
                    }
                    this.initialized = true;
                    return null;
                }
            } catch (error) {
                console.error('Auth Init Error:', error);
                // If API is down and we are not on login page, only redirect if we definitely need auth
                if (!isLoginPage && token) {
                     // Intermittent API error - don't immediately logout to avoid loops
                     console.warn('Backend unreachable. Staying on current page.');
                } else if (!isLoginPage) {
                    this.logout();
                }
                this.initialized = true;
                return null;
            }
        })();

        return this.initPromise;
    },

    /**
     * Logout and cleanup
     */
    logout() {
        localStorage.removeItem('laoverse_jwt');
        window.location.href = 'login.html';
    },

    /**
     * Update global UI elements (like admin name)
     */
    updateUI() {
        if (!this.user) return;
        
        document.querySelectorAll('.admin-name, #adminName').forEach(el => {
            el.textContent = this.user.username;
        });

        if (this.user.profile_pic) {
            const picUrl = window.resolveImageUrl(this.user.profile_pic);
            document.querySelectorAll('.admin-pic').forEach(el => {
                el.src = picUrl;
                el.onerror = () => { el.src = 'images/default-profile.png'; };
            });
        }
    }
};

// Start Auth check immediately
(function() {
    window.authInit = Auth.init();

    document.addEventListener('DOMContentLoaded', () => {
        // Sidebar Toggle Logic
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.querySelector('.sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        if (menuToggle && sidebar && sidebarOverlay) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                sidebarOverlay.classList.toggle('active');
            });

            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            });

            // Close sidebar when clicking menu links on mobile
            sidebar.querySelectorAll('.menu-link').forEach(link => {
                link.addEventListener('click', () => {
                    sidebar.classList.remove('active');
                    sidebarOverlay.classList.remove('active');
                });
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.closest('#logoutBtn')) {
                e.preventDefault();
                Auth.logout();
            }
        });
    });
})();
