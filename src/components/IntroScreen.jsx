import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function IntroScreen({ onComplete }) {
  const [phase, setPhase] = useState('init'); // init → logo → text → bar → exit

  useEffect(() => {
    // Lock body scrolling while splash screen is active
    document.body.style.overflow = 'hidden';

    const t1 = setTimeout(() => setPhase('logo'), 150);
    const t2 = setTimeout(() => setPhase('text'), 650);
    const t3 = setTimeout(() => setPhase('bar'), 1150);
    const t4 = setTimeout(() => setPhase('exit'), 2150);
    const t5 = setTimeout(() => {
      document.body.style.overflow = '';
      if (onComplete) onComplete();
    }, 2650);

    return () => {
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  // Use React Portal to attach directly to document.body (bypasses mobile GPU stacking context bugs)
  return createPortal(
    <div
      className={`fixed inset-0 w-screen h-screen z-[999999] flex flex-col items-center justify-center bg-[#07090e] px-4 select-none transition-all duration-500 ease-in-out
        ${phase === 'exit' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}
      `}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
      }}
    >
      {/* Animated background radial glow */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${phase !== 'init' ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(99,102,241,0.25) 0%, rgba(6,182,212,0.12) 60%, transparent 100%)',
        }}
      />

      {/* Floating particles */}
      {[...Array(14)].map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-full transition-all duration-[1500ms] ${phase !== 'init' ? 'opacity-70' : 'opacity-0'}`}
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#06b6d4' : '#a855f7',
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
            animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random()}s`,
            filter: 'blur(0.5px)',
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6 text-center max-w-sm sm:max-w-md px-4">

        {/* Logo Mark */}
        <div
          className={`transition-all duration-500 ease-out ${
            phase !== 'init' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-6'
          }`}
        >
          <div className="relative">
            {/* Outer ring pulse */}
            <div
              className={`absolute inset-0 rounded-2xl transition-all duration-700 ${
                phase === 'text' || phase === 'bar' ? 'animate-ping opacity-25' : 'opacity-0'
              }`}
              style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', borderRadius: '20px' }}
            />
            {/* Logo box */}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-[20px] sm:rounded-[22px] flex items-center justify-center relative overflow-hidden shadow-2xl mx-auto"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                boxShadow: '0 0 50px rgba(99,102,241,0.6), 0 0 100px rgba(6,182,212,0.35)',
              }}
            >
              {/* Shimmer sweep */}
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)',
                  animation: 'shimmer 1.8s ease-in-out infinite',
                }}
              />
              <span className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight relative z-10">
                FD
              </span>
            </div>
          </div>
        </div>

        {/* Name & Role Text */}
        <div
          className={`text-center transition-all duration-500 ease-out delay-75 ${
            phase === 'text' || phase === 'bar' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
            Fabian<span style={{ color: '#6366f1' }}>.dev</span>
          </h1>
          <p
            className="text-slate-400 text-xs sm:text-base font-medium tracking-widest uppercase mt-1.5 px-2"
            style={{ letterSpacing: '0.2em' }}
          >
            Full-Stack Developer & 3D Web Specialist
          </p>
        </div>

        {/* Loading Progress Bar */}
        <div
          className={`transition-all duration-400 delay-100 ${
            phase === 'bar' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="w-48 sm:w-64 h-[3px] bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-[900ms] ease-out"
              style={{
                width: phase === 'bar' ? '100%' : '0%',
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
                boxShadow: '0 0 12px rgba(99,102,241,0.9)',
              }}
            />
          </div>
          <p className="text-center text-slate-500 text-[11px] font-mono mt-2 tracking-widest">
            MEMUAT PORTFOLIO...
          </p>
        </div>
      </div>

      {/* Inject keyframe animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-10px) translateX(5px); }
          66% { transform: translateY(6px) translateX(-5px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>,
    document.body
  );
}
