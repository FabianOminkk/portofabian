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
  Smartphone,
  RefreshCw,
  LogOut
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

  useEffect(() => {
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
    downloadAnchor.setAttribute("download", `analytics_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] glass-panel border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Private Admin Panel</h3>
              <p className="text-xs text-slate-400">Statistik Views & Log Aktivitas (Khusus Fabian)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!isAuthenticated ? (
            /* PIN Protection Screen */
            <div className="max-w-md mx-auto py-12 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Lock size={32} />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xl text-white">Masukkan PIN Admin</h4>
                <p className="text-xs text-slate-400 mt-1">Area terproteksi khusus pemilik website.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  type="password" 
                  maxLength={10}
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Masukkan PIN (Default: 2026)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-center text-xl font-bold tracking-widest text-white focus:outline-none focus:border-indigo-500"
                />
                {errorMsg && <p className="text-xs text-rose-400 font-semibold">{errorMsg}</p>}
                <button 
                  type="submit" 
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:scale-[1.01] transition-all"
                >
                  Buka Dashboard
                </button>
              </form>
            </div>
          ) : (
            /* Authenticated Admin Dashboard */
            <div className="space-y-6">
              {/* Stat Cards Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-cyan-400 text-xs">
                    <span>Total Views</span>
                    <Eye size={16} />
                  </div>
                  <span className="text-2xl font-heading font-extrabold text-white">{stats.totalViews}</span>
                  <p className="text-[10px] text-slate-400">Total Kunjungan</p>
                </div>

                <div className="glass-card p-4 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-indigo-400 text-xs">
                    <span>Total Log Event</span>
                    <Activity size={16} />
                  </div>
                  <span className="text-2xl font-heading font-extrabold text-white">{stats.logs.length}</span>
                  <p className="text-[10px] text-slate-400">Aktivitas Terrekam</p>
                </div>

                <div className="glass-card p-4 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-purple-400 text-xs">
                    <span>Pesan Masuk</span>
                    <Calendar size={16} />
                  </div>
                  <span className="text-2xl font-heading font-extrabold text-white">
                    {stats.logs.filter(l => l.action.includes('Form')).length}
                  </span>
                  <p className="text-[10px] text-slate-400">Form Submission</p>
                </div>

                <div className="glass-card p-4 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-emerald-400 text-xs">
                    <span>Perangkat Utama</span>
                    <Smartphone size={16} />
                  </div>
                  <span className="text-lg font-heading font-bold text-white">
                    {stats.logs[0]?.device || 'Desktop'}
                  </span>
                  <p className="text-[10px] text-slate-400">Aktivitas Terakhir</p>
                </div>
              </div>

              {/* Daily Views breakdown */}
              <div className="glass-card p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <Calendar size={16} className="text-cyan-400" />
                    <span>Statistik Views Per Hari</span>
                  </h4>
                  <button onClick={refreshData} className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {Object.keys(stats.dailyViews).length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">Belum ada statistik harian.</p>
                  ) : (
                    Object.entries(stats.dailyViews).reverse().map(([date, count]) => (
                      <div key={date} className="flex items-center justify-between text-xs py-1">
                        <span className="text-slate-300 font-mono">{date}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full"
                              style={{ width: `${Math.min((count / stats.totalViews) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-cyan-400 w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Live Activity Logs */}
              <div className="glass-card p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <Activity size={16} className="text-indigo-400" />
                    <span>Log Aktivitas Real-Time</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">{stats.logs.length} entri terbaru</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
                  {stats.logs.length === 0 ? (
                    <p className="text-slate-500 py-4 text-center">Belum ada aktivitas terrekam.</p>
                  ) : (
                    stats.logs.map((log) => (
                      <div key={log.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-indigo-400">{log.action}</span>
                            <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-slate-400">{log.device}</span>
                          </div>
                          <p className="text-slate-300 text-[11px]">{log.details}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">{log.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Admin Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleExportData}
                    className="px-4 py-2 rounded-xl glass-panel text-xs text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-all"
                  >
                    <Download size={14} /> Export JSON
                  </button>

                  <button 
                    onClick={handleClearData}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 hover:bg-rose-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 size={14} /> Reset Log
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
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 w-28"
                  />
                  <button 
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-all flex items-center gap-1"
                  >
                    <KeyRound size={12} /> Ubah PIN
                  </button>
                  {pinChangeSuccess && <span className="text-[10px] text-emerald-400 font-bold">PIN Diubah!</span>}
                </form>

                <button 
                  onClick={() => setIsAuthenticated(false)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 ml-auto"
                >
                  <LogOut size={14} /> Keluar Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
