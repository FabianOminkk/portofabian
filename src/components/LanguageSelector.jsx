import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel text-slate-200 hover:text-white text-xs font-semibold hover:bg-white/10 transition-all border border-white/10"
        title="Pilih Bahasa ASEAN"
      >
        <span className="text-sm">{activeLangObj.flag}</span>
        <span className="hidden sm:inline-block">{activeLangObj.code.toUpperCase()}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 glass-panel rounded-2xl p-2 border border-white/10 shadow-2xl z-50 animate-fadeIn space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/10 mb-1">
            Bahasa ASEAN
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onSelectLang(lang.code);
                setDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                currentLang === lang.code
                  ? 'bg-indigo-600/40 text-cyan-300 font-bold border border-indigo-500/50'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
              {currentLang === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
