// Storage Keys
const VIEWS_KEY = 'fabian_portfolio_views_v1';
const LOGS_KEY = 'fabian_portfolio_logs_v1';
const PIN_KEY = 'fabian_admin_pin_v1';

const DEFAULT_PIN = '2026';
let cachedIP = 'Mengambil IP...';

// Fetch Public IP Address
export async function initIPFetcher() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (res.ok) {
      const data = await res.json();
      cachedIP = data.ip || '127.0.0.1';
    }
  } catch (err) {
    cachedIP = 'Localhost / Offline';
  }
}

// 1. Get or Initialize Page Views
export function trackPageView() {
  try {
    const rawViews = localStorage.getItem(VIEWS_KEY);
    let viewsData = rawViews ? JSON.parse(rawViews) : { total: 0, daily: {} };

    const today = new Date().toISOString().split('T')[0];

    viewsData.total = (viewsData.total || 0) + 1;
    viewsData.daily[today] = (viewsData.daily[today] || 0) + 1;

    localStorage.setItem(VIEWS_KEY, JSON.stringify(viewsData));

    // Log this view as Admin action
    logActivity('Page View', `Admin (Fabian) membuka website portfolio (Total Kunjungan: ${viewsData.total})`);

    return viewsData;
  } catch (err) {
    console.error('Error tracking page view:', err);
    return { total: 1, daily: {} };
  }
}

// 2. Log Specific User/Admin Activity with Full Details
export function logActivity(action, details = '') {
  try {
    const rawLogs = localStorage.getItem(LOGS_KEY);
    let logs = rawLogs ? JSON.parse(rawLogs) : [];

    const newLog = {
      id: Date.now() + Math.random().toString(36).substr(2, 4),
      timestamp: getFullIndonesianTimestamp(),
      ip: cachedIP,
      action,
      details,
      deviceInfo: getDetailedDevice(),
    };

    // Keep latest 100 logs
    logs.unshift(newLog);
    if (logs.length > 100) {
      logs = logs.slice(0, 100);
    }

    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

// 3. Get Stats & Logs for Admin
export function getAdminStats() {
  try {
    const rawViews = localStorage.getItem(VIEWS_KEY);
    const rawLogs = localStorage.getItem(LOGS_KEY);

    const viewsData = rawViews ? JSON.parse(rawViews) : { total: 0, daily: {} };
    const logs = rawLogs ? JSON.parse(rawLogs) : [];

    return {
      totalViews: viewsData.total || 0,
      dailyViews: viewsData.daily || {},
      logs: logs,
    };
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return { totalViews: 0, dailyViews: {}, logs: [] };
  }
}

// 4. Verify Admin PIN
export function verifyPin(inputPin) {
  const storedPin = localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
  return inputPin === storedPin;
}

// 5. Change Admin PIN
export function updatePin(newPin) {
  if (newPin && newPin.length >= 4) {
    localStorage.setItem(PIN_KEY, newPin);
    return true;
  }
  return false;
}

// 6. Clear Logs
export function clearAnalyticsLogs() {
  localStorage.removeItem(LOGS_KEY);
  localStorage.removeItem(VIEWS_KEY);
}

// Helper: Full Indonesian Timestamp (Hari, Tanggal Bulan Tahun - Jam:Menit:Detik WIB)
function getFullIndonesianTimestamp() {
  const now = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const dayName = days[now.getDay()];
  const dateNum = String(now.getDate()).padStart(2, '0');
  const monthName = months[now.getMonth()];
  const year = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${dayName}, ${dateNum} ${monthName} ${year} - ${hours}:${minutes}:${seconds} WIB`;
}

// Helper: Detailed Device, OS, Browser & Screen Info
function getDetailedDevice() {
  const ua = navigator.userAgent;
  let os = 'Windows';
  if (ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Linux') && !ua.includes('Android')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android HP';
  else if (ua.includes('iPhone')) os = 'iPhone iOS';
  else if (ua.includes('iPad')) os = 'iPad iOS';

  let browser = 'Browser';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';

  const screenRes = `${window.screen.width}x${window.screen.height}`;

  return `${os} (${browser}) • ${screenRes}`;
}
