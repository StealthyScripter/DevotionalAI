
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../authService';

const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/signin');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark pb-32">
      <header className="sticky top-0 z-50 glass flex items-center p-4">
        <button onClick={() => navigate(-1)} className="text-white flex size-10 items-center">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-10">Account Settings</h2>
      </header>

      <main className="px-6 py-8 space-y-8">
        <section>
          <div className="bg-surface-dark p-5 rounded-2xl flex items-center justify-between border border-border-dark shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">notifications_active</span>
              </div>
              <div>
                <p className="font-semibold text-sm">Global Notifications</p>
                <p className="text-xs text-slate-400">Master control for all alerts</p>
              </div>
            </div>
            <div className="w-11 h-6 bg-primary rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Daily Rhythms</h2>
          <div className="space-y-3">
            <div className="bg-surface-dark p-4 rounded-2xl border border-border-dark">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                    <span className="material-symbols-outlined">wb_sunny</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Morning Bread</p>
                    <p className="text-[10px] text-slate-500 uppercase">Daily Verse & Manna</p>
                  </div>
                </div>
                <div className="w-11 h-6 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-4">
          <button 
            onClick={handleLogout}
            className="w-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </section>

        <footer className="text-center pt-8 space-y-4 opacity-50">
          <p className="text-[11px] italic text-slate-500 px-12 leading-relaxed">
            "So then, let us not be like others, who are asleep, but let us be awake and sober."
            <span className="block mt-1 font-semibold not-italic">— 1 Thessalonians 5:6</span>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default SettingsScreen;
