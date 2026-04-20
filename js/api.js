/**
 * LaoVerse Admin API Configuration
 * สอดคล้องกับ Frontend และ Cloudflare Tunnel
 */

// ใช้ URL เดียวกับที่ Frontend ใช้ตามที่คุณให้อ่าน
const API_BASE_URL = "https://rolls-corners-cuisine-covering.trycloudflare.com/api";
const BACKEND_URL = API_BASE_URL.replace(/\/api$/, "");

// กำหนดค่าให้ Global
window.API_BASE_URL = API_BASE_URL;
window.BACKEND_URL = BACKEND_URL;

console.log('LaoVerse Admin API Initialized:', window.API_BASE_URL);

/**
 * Helper สำหรับจัดการรูปภาพ
 */
window.resolveImageUrl = function (path) {
    if (!path) return 'images/default-profile.png';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${window.BACKEND_URL}/${cleanPath}`;
};

/**
 * ฟังก์ชันเรียก API มาตรฐาน
 */
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('laoverse_jwt');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    const config = {
        ...options,
        headers
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }

    try {
        const url = `${window.API_BASE_URL}${endpoint}`;
        const response = await fetch(url, config);

        // ถ้า Token หมดอายุ หรือไม่มีสิทธิ์
        if (response.status === 401 || response.status === 403) {
            handleAuthError('Session expired or access denied');
            return { success: false, message: 'Unauthorized' };
        }

        return await response.json();
    } catch (error) {
        console.error('API Call Error:', error);
        return { success: false, message: 'Server connection failed' };
    }
}

/**
 * จัดการเมื่อ Auth มีปัญหา
 */
function handleAuthError(message) {
    const isLoginPage = window.location.pathname.toLowerCase().includes('login');
    if (!isLoginPage) {
        localStorage.removeItem('laoverse_jwt');
        window.location.href = 'login.html?error=' + encodeURIComponent(message);
    }
}
