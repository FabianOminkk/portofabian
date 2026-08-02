import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { LANGUAGES } from '../utils/i18n';

export default function LanguageSelector({ currentLang, onSelectLang }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-2 sm:py-1.5 rounded-xl glass-panel text-slate-200 hover:text-white text-xs font-semibold hover:bg-white/10 active:scale-95 transition-all border border-white/10 touch-manipulation min-h-[38px]"
        title="Pilih Bahasa / Change Language"
      >
        <img
          src={`https://flagcdn.com/w40/${activeLangObj.flagCode}.png`}
          alt={activeLangObj.name}
          className="w-5 h-3.5 object-cover rounded-[3px] shadow-sm shrink-0"
        />
        <span className="font-mono text-xs">{activeLangObj.code.toUpperCase()}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-24px)] glass-panel rounded-2xl p-2 border border-white/15 shadow-2xl z-50 animate-fadeIn space-y-1 backdrop-blur-2xl bg-slate-950/90">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 border-b border-white/10 mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Globe size={13} className="text-cyan-400" />
              <span>Pilih Bahasa / Language</span>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-1 custom-scrollbar">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onSelectLang(lang.code);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all active:scale-[0.98] touch-manipulation ${
                  currentLang === lang.code
                    ? 'bg-indigo-600/50 text-cyan-300 font-bold border border-indigo-500/60'
                    : 'text-slate-300 hover:bg-white/10 active:bg-white/15 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`https://flagcdn.com/w40/${lang.flagCode}.png`}
                    alt={lang.name}
                    className="w-5 h-3.5 object-cover rounded-[3px] shadow-sm border border-white/10 shrink-0"
                  />
                  <span className="text-sm sm:text-xs font-medium">{lang.name}</span>
                </div>
                {currentLang === lang.code && <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
