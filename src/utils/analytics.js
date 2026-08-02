// Storage Keys
const VIEWS_KEY = 'fabian_portfolio_views_v1';
const LOGS_KEY = 'fabian_portfolio_logs_v1';
const PIN_KEY = 'fabian_admin_pin_v1';

// Default Admin PIN (can be changed in Admin Dashboard)
const DEFAULT_PIN = '2026';

// 1. Get or Initialize Page Views
export function trackPageView() {
  try {
    const rawViews = localStorage.getItem(VIEWS_KEY);
    let viewsData = rawViews ? JSON.parse(rawViews) : { total: 0, daily: {} };

    // Format current date YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    viewsData.total = (viewsData.total || 0) + 1;
    viewsData.daily[today] = (viewsData.daily[today] || 0) + 1;

    localStorage.setItem(VIEWS_KEY, JSON.stringify(viewsData));

    // Also log this view in activity log
    logActivity('Page View', `Pengunjung membuka portfolio (Total: ${viewsData.total})`);

    return viewsData;
  } catch (err) {
    console.error('Error tracking page view:', err);
    return { total: 1, daily: {} };
  }
}

// 2. Log Specific User Activity / Event
export function logActivity(action, details = '') {
  try {
    const rawLogs = localStorage.getItem(LOGS_KEY);
    let logs = rawLogs ? JSON.parse(rawLogs) : [];

    const newLog = {
      id: Date.now() + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toLocaleString('id-ID', {
        dateStyle: 'short',
        timeStyle: 'medium',
      }),
      action,
      details,
      device: getDeviceType(),
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

// Helper: Detect Device Type
function getDeviceType() {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'Mobile';
  if (/ipad|tablet/i.test(ua)) return 'Tablet';
  return 'Desktop';
}
