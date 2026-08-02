import { useState, useEffect } from 'react';
import ThreeBackground from './components/ThreeBackground';
import AdminDashboard from './components/AdminDashboard';
import LanguageSelector from './components/LanguageSelector';
import IntroScreen from './components/IntroScreen';
import { trackPageView, logActivity, initIPFetcher } from './utils/analytics';
import { translations } from './utils/i18n';
import { 
  Code2, 
  Boxes, 
  Server, 
  ArrowRight, 
  User, 
  Menu, 
  X, 
  Send, 
  CheckCircle, 
  Sparkles,
  Layers,
  Cpu,
  Globe,
  Lock,
  GraduationCap
} from 'lucide-react';

function GithubIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
    </svg>
  );
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Show intro only once per browser session
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('fabian_intro_seen');
  });

  const handleIntroDone = () => {
    sessionStorage.setItem('fabian_intro_seen', '1');
    setShowIntro(false);
  };

  // Multi-Language State (Default: Bahasa Indonesia, remembers choice in localStorage)
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem('fabian_lang') || 'id');

  const t = translations[currentLang] || translations.id;

  const handleSelectLang = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem('fabian_lang', langCode);
    logActivity('Ganti Bahasa', `Pengunjung mengganti bahasa ke ${langCode.toUpperCase()}`);
  };

  useEffect(() => {
    // Initialize IP address fetcher & automatically track Page View
    initIPFetcher().then(() => {
      trackPageView();
    });

    // Keyboard shortcut: Ctrl + Shift + A toggles Private Admin Panel
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setFormError(false);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_KEY || '00000000-0000-0000-0000-000000000000',
          subject: `[Portfolio] Pesan Baru dari ${formData.name}`,
          from_name: formData.name,
          email: formData.email,
          message: formData.message,
          botcheck: '',
        }),
      });

      const result = await response.json();

      if (result.success) {
        logActivity('Submit Contact Form', `Pesan masuk dari ${formData.name} (${formData.email}) — Dikirim ke email admin`);
        setFormSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setFormSubmitted(false), 6000);
      } else {
        setFormError(true);
        setTimeout(() => setFormError(false), 5000);
      }
    } catch (err) {
      setFormError(true);
      setTimeout(() => setFormError(false), 5000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative min-h-screen" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Cinematic Intro Screen (first visit per session) */}
      {showIntro && <IntroScreen onComplete={handleIntroDone} />}
      {/* 3D WebGL Background */}
      <ThreeBackground />

      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4">
        <nav className="max-w-7xl mx-auto glass-panel rounded-2xl px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xl">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[2px] transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center font-heading font-extrabold text-lg text-white">
                FD
              </div>
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              Fabian<span className="text-indigo-500">.dev</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#about" className="hover:text-cyan-400 transition-colors">{t.navAbout}</a>
            <a href="#skills" className="hover:text-cyan-400 transition-colors">{t.navSkills}</a>
            <a href="#projects" className="hover:text-cyan-400 transition-colors">{t.navProjects}</a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors">{t.navContact}</a>
          </div>

          {/* Header Actions (Language Selector + CTA Button + Mobile Toggle) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* ASEAN Language Dropdown Selector */}
            <LanguageSelector 
              currentLang={currentLang} 
              onSelectLang={handleSelectLang} 
            />

            <a 
              href="#contact" 
              className="hidden sm:inline-flex px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all"
            >
              {t.navContactBtn}
            </a>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-white p-2"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden max-w-7xl mx-auto mt-2 glass-panel rounded-2xl p-6 flex flex-col gap-4 text-center text-sm font-medium animate-fadeIn">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-cyan-400 transition-colors">{t.navAbout}</a>
            <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-cyan-400 transition-colors">{t.navSkills}</a>
            <a href="#projects" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-cyan-400 transition-colors">{t.navProjects}</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-cyan-400 transition-colors">{t.navContact}</a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold"
            >
              {t.navContactBtn}
            </a>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="min-h-screen relative flex items-center justify-center px-4 sm:px-6 pt-24 pb-16 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center z-10 space-y-8">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/10 text-xs sm:text-sm font-medium text-slate-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              {t.heroStatus}
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold tracking-tight leading-tight text-white">
                {t.heroGreeting} <span className="text-gradient">Fabian</span>
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl font-heading font-semibold text-slate-300">
                {t.heroRole1} <span className="text-cyan-400">{t.heroRole2}</span>
              </p>
            </div>

            {/* Subtext */}
            <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
              {t.heroSubtext}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
              <a 
                href="#projects" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-semibold text-base shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all flex items-center justify-center gap-3 group"
              >
                <span>{t.heroCtaProject}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="https://github.com/FabianOminkk" 
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-xl glass-panel text-slate-200 font-semibold text-base hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all flex items-center justify-center gap-2 hover:text-cyan-400"
              >
                <GithubIcon size={20} />
                <span>GitHub</span>
              </a>
              <a 
                href="https://www.linkedin.com/in/fabian-nazhif-29997a346/" 
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-xl glass-panel text-slate-200 font-semibold text-base hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all flex items-center justify-center gap-2 hover:text-cyan-400"
              >
                <LinkedinIcon size={20} />
                <span>LinkedIn</span>
              </a>
            </div>

            {/* Quick Tech Badges */}
            <div className="pt-12 flex flex-wrap items-center justify-center gap-4 text-slate-400 text-sm font-medium">
              <span className="px-4 py-2 rounded-xl glass-card flex items-center gap-2 text-cyan-400">
                <Globe size={16} /> React.js & Vite
              </span>
              <span className="px-4 py-2 rounded-xl glass-card flex items-center gap-2 text-purple-400">
                <Sparkles size={16} /> Three.js 3D
              </span>
              <span className="px-4 py-2 rounded-xl glass-card flex items-center gap-2 text-indigo-400">
                <Layers size={16} /> Tailwind CSS
              </span>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 px-4 sm:px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-400">{t.aboutBadge}</h2>
              <h3 className="text-3xl sm:text-4xl font-heading font-bold text-white">{t.aboutTitle}</h3>
              <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-12 gap-8 items-center">
              {/* Text Card */}
              <div className="md:col-span-7 glass-panel p-8 sm:p-10 rounded-3xl space-y-6">
                <h4 className="text-2xl font-heading font-bold text-slate-100">
                  {t.aboutSub}
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {t.aboutP1}
                </p>
                <p className="text-slate-400 leading-relaxed">
                  {t.aboutP2}
                </p>

                <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-white/10">
                  <div>
                    <span className="block text-2xl font-heading font-bold text-cyan-400">3+</span>
                    <span className="text-xs text-slate-400">{t.aboutExp}</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-heading font-bold text-indigo-400">15+</span>
                    <span className="text-xs text-slate-400">{t.aboutCompleted}</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-heading font-bold text-purple-400">100%</span>
                    <span className="text-xs text-slate-400">{t.aboutQuality}</span>
                  </div>
                </div>
              </div>

              {/* Feature Highlight & Education Cards */}
              <div className="md:col-span-5 space-y-4">
                {/* Education & Age Highlight Card */}
                <div className="glass-card p-6 rounded-2xl flex items-start gap-4 border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-slate-900/40 to-indigo-950/20">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                    <GraduationCap size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-heading font-bold text-white text-base">{t.aboutEduSchool}</h5>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold shrink-0">
                        {t.aboutEduAgeLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">{t.aboutEduDegree}</p>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                    <Code2 size={24} />
                  </div>
                  <div>
                    <h5 className="font-heading font-semibold text-white mb-1">{t.featFe}</h5>
                    <p className="text-xs text-slate-400">{t.featFeDesc}</p>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                    <Boxes size={24} />
                  </div>
                  <div>
                    <h5 className="font-heading font-semibold text-white mb-1">{t.feat3d}</h5>
                    <p className="text-xs text-slate-400">{t.feat3dDesc}</p>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                    <Server size={24} />
                  </div>
                  <div>
                    <h5 className="font-heading font-semibold text-white mb-1">{t.featBe}</h5>
                    <p className="text-xs text-slate-400">{t.featBeDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-24 px-4 sm:px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400">{t.skillsBadge}</h2>
              <h3 className="text-3xl sm:text-4xl font-heading font-bold text-white">{t.skillsTitle}</h3>
              <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-cyan-400 mx-auto rounded-full"></div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div className="text-amber-400 text-3xl mb-2"><Code2 size={32} /></div>
                <h4 className="font-heading font-bold text-lg text-white">Languages</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center justify-between"><span>JavaScript (ES6+)</span> <span className="text-xs font-semibold text-cyan-400">Advanced</span></li>
                  <li className="flex items-center justify-between"><span>TypeScript</span> <span className="text-xs font-semibold text-cyan-400">Intermediate</span></li>
                  <li className="flex items-center justify-between"><span>HTML5 / CSS3</span> <span className="text-xs font-semibold text-cyan-400">Expert</span></li>
                </ul>
              </div>

              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div className="text-sky-400 text-3xl mb-2"><Globe size={32} /></div>
                <h4 className="font-heading font-bold text-lg text-white">Frontend</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center justify-between"><span>React.js</span> <span className="text-xs font-semibold text-cyan-400">Advanced</span></li>
                  <li className="flex items-center justify-between"><span>Tailwind CSS</span> <span className="text-xs font-semibold text-cyan-400">Expert</span></li>
                  <li className="flex items-center justify-between"><span>Next.js</span> <span className="text-xs font-semibold text-cyan-400">Intermediate</span></li>
                </ul>
              </div>

              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div className="text-purple-400 text-3xl mb-2"><Boxes size={32} /></div>
                <h4 className="font-heading font-bold text-lg text-white">3D & Animation</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center justify-between"><span>Three.js</span> <span className="text-xs font-semibold text-cyan-400">Advanced</span></li>
                  <li className="flex items-center justify-between"><span>WebGL Basics</span> <span className="text-xs font-semibold text-cyan-400">Intermediate</span></li>
                  <li className="flex items-center justify-between"><span>CSS Keyframes</span> <span className="text-xs font-semibold text-cyan-400">Advanced</span></li>
                </ul>
              </div>

              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div className="text-emerald-400 text-3xl mb-2"><Cpu size={32} /></div>
                <h4 className="font-heading font-bold text-lg text-white">Backend & Tools</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center justify-between"><span>Node.js / Express</span> <span className="text-xs font-semibold text-cyan-400">Intermediate</span></li>
                  <li className="flex items-center justify-between"><span>Git / GitHub</span> <span className="text-xs font-semibold text-cyan-400">Advanced</span></li>
                  <li className="flex items-center justify-between"><span>Vite / Webpack</span> <span className="text-xs font-semibold text-cyan-400">Advanced</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-24 px-4 sm:px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-400">{t.projBadge}</h2>
              <h3 className="text-3xl sm:text-4xl font-heading font-bold text-white">{t.projTitle}</h3>
              <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Project 1 */}
              <div className="glass-card rounded-2xl overflow-hidden flex flex-col group">
                <div className="h-48 bg-gradient-to-tr from-indigo-950 via-purple-950 to-slate-900 relative p-6 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d111a] to-transparent opacity-80 z-10"></div>
                  <Boxes size={64} className="text-cyan-400/40 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
                  <span className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-500/50 text-xs text-cyan-300 font-semibold">
                    3D React App
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-heading font-bold text-xl text-white group-hover:text-cyan-400 transition-colors">3D Product Showcase</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{t.proj1Desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2.5 py-1 rounded-md bg-white/5 text-[11px] text-slate-300">Three.js</span>
                    <span className="px-2.5 py-1 rounded-md bg-white/5 text-[11px] text-slate-300">React</span>
                    <span className="px-2.5 py-1 rounded-md bg-white/5 text-[11px] text-slate-300">Tailwind</span>
                  </div>
                </div>
              </div>

              {/* Project 2 */}
              <div className="glass-card rounded-2xl overflow-hidden flex flex-col group">
                <div className="h-48 bg-gradient-to-tr from-slate-900 via-teal-950 to-indigo-950 relative p-6 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d111a] to-transparent opacity-80 z-10"></div>
                  <Server size={64} className="text-indigo-400/40 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500" />
                  <span className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-500/50 text-xs text-purple-300 font-semibold">
                    Fullstack
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-heading font-bold text-xl text-white group-hover:text-cyan-400 transition-colors">Analytics Dashboard</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{t.proj2Desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2.5 py-1 rounded-md bg-white/5 text-[11px] text-slate-300">React</span>
                    <span className="px-2.5 py-1 rounded-md bg-white/5 text-[11px] text-slate-300">Node.js</span>
                    <span className="px-2.5 py-1 rounded-md bg-white/5 text-[11px] text-slate-300">REST API</span>
                  </div>
                </div>
              </div>

              {/* Project 3 */}
              <div className="glass-card rounded-2xl overflow-hidden flex flex-col group">
                <div className="h-48 bg-gradient-to-tr from-purple-950 via-slate-900 to-indigo-900 relative p-6 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d111a] to-transparent opacity-80 z-10"></div>
                  <Globe size={64} className="text-purple-400/40 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" />
                  <span className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-cyan-500/30 border border-cyan-500/50 text-xs text-cyan-300 font-semibold">
                    Web Platform
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-heading font-bold text-xl text-white group-hover:text-cyan-400 transition-colors">SaaS Landing Page</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{t.proj3Desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2.5 py-1 rounded-md bg-white/5 text-[11px] text-slate-300">Vite</span>
                    <span className="px-2.5 py-1 rounded-md bg-white/5 text-[11px] text-slate-300">Tailwind</span>
                    <span className="px-2.5 py-1 rounded-md bg-white/5 text-[11px] text-slate-300">React</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 px-4 sm:px-6 relative">
          <div className="max-w-4xl mx-auto">
            <div className="glass-panel p-8 sm:p-12 rounded-3xl space-y-8 relative overflow-hidden">
              <div className="text-center space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-400">{t.contactBadge}</h2>
                <h3 className="text-3xl sm:text-4xl font-heading font-bold text-white">{t.contactTitle}</h3>
                <p className="text-slate-400 text-sm max-w-xl mx-auto">{t.contactSub}</p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">{t.contactName}</label>
                    <input 
                      type="text" 
                      id="name" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">{t.contactEmail}</label>
                    <input 
                      type="email" 
                      id="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">{t.contactMsg}</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    required 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t.contactPlaceholderMsg} 
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSending}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-bold text-base shadow-lg shadow-indigo-500/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>{t.contactSubmit}</span>
                    </>
                  )}
                </button>
              </form>

              {formSubmitted && (
                <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center text-sm flex items-center justify-center gap-2 animate-fadeIn">
                  <CheckCircle size={18} />
                  <span>{t.contactSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-center text-sm flex items-center justify-center gap-2 animate-fadeIn">
                  <X size={18} />
                  <span>Gagal mengirim pesan. Coba lagi atau hubungi langsung via email.</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <p>&copy; {t.footerCopy}</p>
            {/* Secret Private Admin Button (Clickable lock) */}
            <button 
              onClick={() => setIsAdminOpen(true)}
              className="text-slate-600 hover:text-indigo-400 transition-colors p-1"
              title="Private Admin Panel (PIN Protected)"
            >
              <Lock size={12} />
            </button>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <a 
              href="https://github.com/FabianOminkk" 
              target="_blank" 
              rel="noreferrer" 
              onClick={() => logActivity('Klik GitHub', 'Pengunjung mengklik link GitHub profil')}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-medium" 
              title="GitHub FabianOminkk"
            >
              <GithubIcon size={18} />
              <span className="text-xs">GitHub</span>
            </a>
            <a 
              href="https://www.linkedin.com/in/fabian-nazhif-29997a346/" 
              target="_blank" 
              rel="noreferrer" 
              onClick={() => logActivity('Klik LinkedIn', 'Pengunjung mengklik link LinkedIn profil')}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-medium" 
              title="LinkedIn Fabian Nazhif"
            >
              <LinkedinIcon size={18} />
              <span className="text-xs">LinkedIn</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Private Admin Dashboard Modal (PIN Protected) */}
      <AdminDashboard 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
      />
    </div>
  );
}
