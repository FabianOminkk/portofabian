import { useEffect, useState } from 'react';

export default function IntroScreen({ onComplete }) {
  const [phase, setPhase] = useState('init'); // init → logo → text → bar → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logo'), 300);
    const t2 = setTimeout(() => setPhase('text'), 1200);
    const t3 = setTimeout(() => setPhase('bar'), 1900);
    const t4 = setTimeout(() => setPhase('exit'), 3400);
    const t5 = setTimeout(() => onComplete(), 3900);

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 w-full h-full min-h-screen z-[99999] flex flex-col items-center justify-center bg-[#07090e] px-4 transition-all duration-500 ease-in-out
        ${phase === 'exit' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}
      `}
    >
      {/* Animated background radial glow */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${phase !== 'init' ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.2) 0%, rgba(6,182,212,0.1) 60%, transparent 100%)',
        }}
      />

      {/* Floating particles */}
      {[...Array(14)].map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-full transition-all duration-[2000ms] ${phase !== 'init' ? 'opacity-70' : 'opacity-0'}`}
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#06b6d4' : '#a855f7',
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
            animation: `float ${Math.random() * 3 + 3}s ease-in-out infinite ${Math.random() * 2}s`,
            filter: 'blur(0.5px)',
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6 select-none text-center max-w-sm sm:max-w-md">

        {/* Logo Mark */}
        <div
          className={`transition-all duration-700 ease-out ${
            phase !== 'init' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-6'
          }`}
        >
          <div className="relative">
            {/* Outer ring pulse */}
            <div
              className={`absolute inset-0 rounded-2xl transition-all duration-1000 ${
                phase === 'text' || phase === 'bar' ? 'animate-ping opacity-20' : 'opacity-0'
              }`}
              style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', borderRadius: '18px' }}
            />
            {/* Logo box */}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-[20px] sm:rounded-[22px] flex items-center justify-center relative overflow-hidden shadow-2xl mx-auto"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                boxShadow: '0 0 50px rgba(99,102,241,0.5), 0 0 100px rgba(6,182,212,0.3)',
              }}
            >
              {/* Shimmer sweep */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                  animation: 'shimmer 2s ease-in-out infinite',
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
          className={`text-center transition-all duration-700 ease-out delay-100 ${
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
          className={`transition-all duration-500 delay-200 ${
            phase === 'bar' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="w-48 sm:w-64 h-[3px] bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-[1400ms] ease-out"
              style={{
                width: phase === 'bar' ? '100%' : '0%',
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
                boxShadow: '0 0 12px rgba(99,102,241,0.8)',
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
          33% { transform: translateY(-12px) translateX(6px); }
          66% { transform: translateY(8px) translateX(-6px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
