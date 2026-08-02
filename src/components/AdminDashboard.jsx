import { useState, useEffect } from 'react';
import { 
  Lock, 
  Eye, 
  Activity, 
  ShieldCheck, 
  X, 
  Trash2, 
  Download, 
  KeyRound, 
  Calendar,
  RefreshCw,
  LogOut,
  Globe,
  Monitor
} from 'lucide-react';
import { 
  getAdminStats, 
  verifyPin, 
  updatePin, 
  clearAnalyticsLogs 
} from '../utils/analytics';

export default function AdminDashboard({ isOpen, onClose }) {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [stats, setStats] = useState({ totalViews: 0, dailyViews: {}, logs: [] });
  const [newPin, setNewPin] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  // Reset PIN input whenever modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setPinInput('');
      setErrorMsg('');
    }
    if (isOpen && isAuthenticated) {
      refreshData();
    }
  }, [isOpen, isAuthenticated]);

  const refreshData = () => {
    const data = getAdminStats();
    setStats(data);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (verifyPin(pinInput)) {
      setIsAuthenticated(true);
      setErrorMsg('');
      setPinInput('');
      refreshData();
    } else {
      setErrorMsg('PIN salah! Silakan coba lagi.');
    }
  };

  const handlePinChange = (e) => {
    e.preventDefault();
    if (updatePin(newPin)) {
      setPinChangeSuccess(true);
      setNewPin('');
      setTimeout(() => setPinChangeSuccess(false), 3000);
    } else {
      alert('PIN minimal harus 4 karakter!');
    }
  };

  const handleClearData = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh log aktivitas dan statistik views?')) {
      clearAnalyticsLogs();
      refreshData();
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `analytics_log_fabian_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg animate-fadeIn">
      <div className="w-full max-w-5xl max-h-[92vh] glass-panel border border-white/15 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl text-white">Private Admin Panel</h3>
              <p className="text-xs text-slate-300">Statistik Kunjungan, IP Address & Detail Log Aktivitas (Khusus Fabian)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!isAuthenticated ? (
            /* PIN Protection Screen */
            <div className="max-w-md mx-auto py-12 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-xl">
                <Lock size={40} />
              </div>
              <div>
                <h4 className="font-heading font-bold text-2xl text-white">Masukkan PIN Admin</h4>
                <p className="text-sm text-slate-300 mt-1">Area terproteksi khusus pemilik website (Fabian).</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  type="password" 
                  maxLength={10}
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Masukkan PIN (Default: 2026)"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-white/20 text-center text-2xl font-bold tracking-widest text-white focus:outline-none focus:border-indigo-500"
                />
                {errorMsg && <p className="text-sm text-rose-400 font-semibold">{errorMsg}</p>}
                <button 
                  type="submit" 
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-bold text-base shadow-lg shadow-indigo-500/30 hover:scale-[1.01] transition-all"
                >
                  Buka Dashboard Admin
                </button>
              </form>
            </div>
          ) : (
            /* Authenticated Admin Dashboard */
            <div className="space-y-6">
              {/* Stat Cards Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-2xl space-y-2 border border-white/10">
                  <div className="flex items-center justify-between text-cyan-400 text-sm font-semibold">
                    <span>Total Views</span>
                    <Eye size={20} />
                  </div>
                  <span className="text-3xl font-heading font-extrabold text-white">{stats.totalViews}</span>
                  <p className="text-xs text-slate-300">Total Kunjungan Web</p>
                </div>

                <div className="glass-card p-5 rounded-2xl space-y-2 border border-white/10">
                  <div className="flex items-center justify-between text-indigo-400 text-sm font-semibold">
                    <span>Total Log Event</span>
                    <Activity size={20} />
                  </div>
                  <span className="text-3xl font-heading font-extrabold text-white">{stats.logs.length}</span>
                  <p className="text-xs text-slate-300">Aktivitas Terdaftar</p>
                </div>

                <div className="glass-card p-5 rounded-2xl space-y-2 border border-white/10">
                  <div className="flex items-center justify-between text-purple-400 text-sm font-semibold">
                    <span>Pesan Masuk</span>
                    <Calendar size={20} />
                  </div>
                  <span className="text-3xl font-heading font-extrabold text-white">
                    {stats.logs.filter(l => l.action.includes('Form')).length}
                  </span>
                  <p className="text-xs text-slate-300">Form Submission</p>
                </div>

                <div className="glass-card p-5 rounded-2xl space-y-2 border border-white/10">
                  <div className="flex items-center justify-between text-emerald-400 text-sm font-semibold">
                    <span>IP Terakhir</span>
                    <Globe size={20} />
                  </div>
                  <span className="text-base font-heading font-bold text-white tracking-wide truncate block">
                    {stats.logs[0]?.ip || 'Localhost'}
                  </span>
                  <p className="text-xs text-slate-300">IP Public Pengguna</p>
                </div>
              </div>

              {/* Daily Views breakdown */}
              <div className="glass-card p-6 rounded-2xl space-y-4 border border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <Calendar size={18} className="text-cyan-400" />
                    <span>Statistik Views Per Hari</span>
                  </h4>
                  <button onClick={refreshData} className="text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <RefreshCw size={14} /> Refresh Data
                  </button>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {Object.keys(stats.dailyViews).length === 0 ? (
                    <p className="text-sm text-slate-400 py-2">Belum ada statistik harian.</p>
                  ) : (
                    Object.entries(stats.dailyViews).reverse().map(([date, count]) => (
                      <div key={date} className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-slate-200 font-mono font-medium">{date}</span>
                        <div className="flex items-center gap-4">
                          <div className="w-40 sm:w-64 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 h-full rounded-full"
                              style={{ width: `${Math.min((count / stats.totalViews) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-cyan-400 text-sm w-12 text-right">{count} views</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Live Activity Logs with Clear Typography & Detailed Info */}
              <div className="glass-card p-6 rounded-2xl space-y-4 border border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <Activity size={18} className="text-indigo-400" />
                    <span>Log Aktivitas Admin & Kunjungan Real-Time</span>
                  </h4>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {stats.logs.length} entri terbaru
                  </span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {stats.logs.length === 0 ? (
                    <p className="text-slate-400 py-6 text-center text-sm">Belum ada aktivitas terrekam.</p>
                  ) : (
                    stats.logs.map((log) => (
                      <div 
                        key={log.id} 
                        className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/40 transition-all space-y-2"
                      >
                        {/* Top Row: Action Title & Device Pill */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-base text-cyan-300">
                              {log.action}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1">
                              <Monitor size={12} />
                              {log.deviceInfo || log.device || 'Desktop'}
                            </span>
                          </div>

                          <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                            IP: {log.ip || 'Localhost'}
                          </span>
                        </div>

                        {/* Middle Row: Detailed Description */}
                        <p className="text-sm font-medium text-slate-200 leading-relaxed">
                          {log.details}
                        </p>

                        {/* Bottom Row: Full Timestamp (Hari, Tanggal Bulan Tahun - Jam:Menit:Detik WIB) */}
                        <div className="pt-1 text-xs font-mono text-slate-400 flex items-center gap-1.5 border-t border-white/5">
                          <Calendar size={12} className="text-cyan-400" />
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Admin Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleExportData}
                    className="px-4 py-2.5 rounded-xl glass-panel text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-all"
                  >
                    <Download size={16} /> Export Data (JSON)
                  </button>

                  <button 
                    onClick={handleClearData}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs sm:text-sm font-semibold text-rose-400 hover:bg-rose-500/20 flex items-center gap-2 transition-all"
                  >
                    <Trash2 size={16} /> Reset Log
                  </button>
                </div>

                {/* Change PIN Form */}
                <form onSubmit={handlePinChange} className="flex items-center gap-2">
                  <input 
                    type="password"
                    maxLength={10}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="PIN Baru"
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-white/20 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 w-32"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-500 transition-all flex items-center gap-1.5"
                  >
                    <KeyRound size={14} /> Ubah PIN
                  </button>
                  {pinChangeSuccess && <span className="text-xs text-emerald-400 font-bold">PIN Diubah!</span>}
                </form>

                <button 
                  onClick={() => setIsAuthenticated(false)}
                  className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 ml-auto"
                >
                  <LogOut size={16} /> Keluar Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
