
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background-dark">
      <div className="absolute inset-0 z-0">
        <div 
          className="h-full w-full bg-cover bg-center" 
          style={{ backgroundImage: `linear-gradient(to bottom, rgba(10, 15, 22, 0.2) 0%, rgba(10, 15, 22, 0.8) 50%, rgba(10, 15, 22, 1) 100%), url('https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=800&auto=format&fit=crop')` }}
        >
        </div>
      </div>

      <div className="relative z-10 flex h-11 w-full items-center justify-between px-6 text-white pt-2">
        <span className="text-sm font-semibold">9:41</span>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">signal_cellular_4_bar</span>
          <span className="material-symbols-outlined text-[18px]">wifi</span>
          <span className="material-symbols-outlined text-[18px]">battery_full</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-end px-8 pb-20">
        <div className="mb-8 space-y-4">
          <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-white mb-6 glowing-button">
            <span className="material-symbols-outlined text-3xl">church</span>
          </div>
          <h1 className="text-white tracking-tight text-[48px] font-display font-bold leading-[1.05]">
            Nourish Your <br/>Spiritual Life
          </h1>
          <p className="text-white/60 text-lg font-medium leading-relaxed font-sans max-w-[280px]">
            Personalized Christian guidance, scripture, and community.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => navigate('/signup')}
            className="flex w-full items-center justify-center rounded-2xl h-16 bg-primary text-white text-lg font-bold transition-transform active:scale-95 shadow-2xl shadow-primary/30"
          >
            Start Your Journey
          </button>
          <button 
            onClick={() => navigate('/signin')}
            className="flex w-full items-center justify-center h-12 bg-transparent text-white/50 text-sm font-bold uppercase tracking-widest"
          >
            Sign In to Account
          </button>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">
            "Trust in the Lord with all your heart" — Proverbs 3:5
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingScreen;
