
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../authService';

const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('devotional_theme');
    return saved ? saved === 'dark' : true; 
  });
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('devotional_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('devotional_theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    authService.logout();
    navigate('/signin');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark dark:bg-background-dark bg-white pb-32 transition-colors duration-300">
      {showHelp && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-surface-dark w-full max-w-sm rounded-[40px] border border-white/10 p-8 space-y-6 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold font-jakarta">Sanctuary Help</h3>
              <button onClick={() => setShowHelp(false)} className="size-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-8 no-scrollbar text-sm text-slate-400 leading-relaxed font-display pb-6">
              <section className="space-y-3">
                <h4 className="text-white font-bold uppercase tracking-widest text-[10px]">How to use the app</h4>
                <p>Welcome to your digital spiritual companion. Use the navigation bar to travel between the Home Feed, Discover, and your Profile.</p>
              </section>
              <section className="space-y-3">
                <h4 className="text-white font-bold uppercase tracking-widest text-[10px]">Invoke AI Pastor</h4>
                <p>Tap the 'Generate' button (on supported screens) to open the Devotional Studio. Here you can request personalized messages based on specific themes or verses.</p>
              </section>
              <section className="space-y-3">
                <h4 className="text-white font-bold uppercase tracking-widest text-[10px]">The Journal</h4>
                <p>Visit your Profile to find your Prayer Journal. Use this to record personal reflections, prayers, and gratitude. Entries are stored privately on your device.</p>
              </section>
              <section className="space-y-3">
                <h4 className="text-white font-bold uppercase tracking-widest text-[10px]">AI Chat Counsel</h4>
                <p>Access the Chat tab to talk directly with the AI Pastor. You can ask for scripture clarification, prayer guidance, or spiritual encouragement.</p>
              </section>
            </div>
            <button 
              onClick={() => setShowHelp(false)}
              className="w-full bg-primary py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest"
            >
              God Bless
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 glass flex items-center p-4 border-b border-black/5 dark:border-white/5">
        <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-base font-bold flex-1 text-center font-jakarta text-slate-900 dark:text-white">Settings</h2>
        <div className="w-10"></div>
      </header>

      <main className="px-6 py-8 space-y-8 max-w-md mx-auto w-full">
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-1">Preference</h2>
          
          <div className="bg-slate-50 dark:bg-surface-dark p-5 rounded-[24px] flex items-center justify-between border border-black/5 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-xl">{isDarkMode ? 'dark_mode' : 'light_mode'}</span>
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">Appearance</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${isDarkMode ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md ${isDarkMode ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-1">Support</h2>
          <button 
            onClick={() => setShowHelp(true)}
            className="w-full bg-slate-50 dark:bg-surface-dark p-5 rounded-[24px] flex items-center justify-between border border-black/5 dark:border-white/5 shadow-sm text-left active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-xl">help</span>
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">Help & Manual</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Guide to the Tabernacle</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
          </button>

          <div className="bg-slate-50 dark:bg-surface-dark p-5 rounded-[24px] flex items-center justify-between border border-black/5 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="size-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                <span className="material-symbols-outlined text-xl">notifications</span>
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">Global Alerts</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Daily Reminders</p>
              </div>
            </div>
            <button className="w-12 h-6 bg-primary rounded-full relative focus:outline-none">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md"></div>
            </button>
          </div>
        </section>

        <section className="pt-8">
          <button 
            onClick={handleLogout}
            className="w-full bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-[0.2em] py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Sign Out
          </button>
        </section>

        <footer className="text-center pt-12 space-y-4 opacity-40">
          <p className="text-[11px] italic text-slate-500 dark:text-slate-400 px-8 leading-relaxed font-display">
            "So then, let us not be like others, who are asleep, but let us be awake and sober."
            <span className="block mt-2 font-bold not-italic tracking-widest uppercase text-[9px]">— 1 Thessalonians 5:6</span>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default SettingsScreen;
