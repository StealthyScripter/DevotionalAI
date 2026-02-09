
import React, { useEffect, useState } from 'react';
import { GeneratedContent } from '../types';
import { storageService } from '../storageService';
import { authService } from '../authService';
import { useNavigate } from 'react-router-dom';

interface Props {
  onSelectSaved: (content: GeneratedContent) => void;
}

interface PrayerEntry {
  id: number;
  text: string;
  date: string;
}

const ProfileScreen: React.FC<Props> = ({ onSelectSaved }) => {
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState<GeneratedContent[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'journal'>('saved');
  const session = authService.getSession();
  const userEmail = session?.user.email || 'user@example.com';
  const userName = userEmail.split('@')[0];

  const [prayers, setPrayers] = useState<PrayerEntry[]>([]);
  const [newEntryId, setNewEntryId] = useState<number | null>(null);
  const streakCount = 14;

  useEffect(() => {
    setSavedItems(storageService.getSavedDevotionals());
    const storedPrayers = localStorage.getItem('devotional_journal');
    if (storedPrayers) {
      setPrayers(JSON.parse(storedPrayers));
    } else {
      const initial = [
        { id: 1, text: "Praying for family health and guidance in new job.", date: "Oct 12" },
        { id: 2, text: "Thankful for the peace I felt during morning prayer.", date: "Oct 10" }
      ];
      setPrayers(initial);
      localStorage.setItem('devotional_journal', JSON.stringify(initial));
    }
  }, []);

  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-white text-background-dark px-6 py-4 rounded-full text-[9px] font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(255,255,255,0.2)] z-[200] animate-in slide-in-from-bottom-2 fade-in duration-500';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-2');
      setTimeout(() => toast.remove(), 500);
    }, 2000);
  };

  const handleAddJournal = () => {
    const text = window.prompt("Write your reflection or prayer...");
    if (text && text.trim()) {
      const entryId = Date.now();
      const newEntry: PrayerEntry = {
        id: entryId,
        text: text.trim(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
      const updated = [newEntry, ...prayers];
      setPrayers(updated);
      setNewEntryId(entryId);
      localStorage.setItem('devotional_journal', JSON.stringify(updated));
      showToast('Chronicle Preserved');
      
      setTimeout(() => setNewEntryId(null), 4000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark pb-32 transition-colors duration-300">
      <header className="sticky top-0 z-50 glass flex items-center p-4 justify-between border-b border-white/5">
        <button onClick={() => navigate('/settings')} className="text-white flex size-10 items-center justify-center rounded-full hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <h2 className="text-sm font-black uppercase tracking-[0.3em] font-jakarta">My Tabernacle</h2>
        <div className="w-10"></div>
      </header>

      <main className="pt-8">
        <div className="px-6 flex flex-col items-center">
          <div className="size-28 rounded-full border-[6px] border-primary/20 bg-cover bg-center mb-6 p-1.5 shadow-3xl shadow-primary/20 relative animate-in zoom-in duration-700">
             <div className="absolute -bottom-1 -right-1 size-9 rounded-full bg-primary border-4 border-background-dark flex items-center justify-center shadow-lg">
               <span className="material-symbols-outlined text-white text-[14px] font-black">verified</span>
             </div>
             <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url('https://picsum.photos/seed/${userName}/300/300')` }} />
          </div>
          <h1 className="text-2xl font-bold font-jakarta capitalize text-white tracking-tight">{userName}</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 mb-10 opacity-60">{userEmail}</p>
          
          <section className="w-full bg-surface-dark/40 backdrop-blur-xl border border-white/5 p-10 rounded-[48px] mb-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 size-40 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-1000"></div>
            <div className="flex justify-between items-end mb-8 relative z-10">
              <div>
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em] mb-3">Devotion Streak</p>
                <h3 className="text-white font-bold text-4xl tracking-tight leading-none">{streakCount} Days</h3>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <span className="material-symbols-outlined fill-current text-4xl animate-bounce-subtle">local_fire_department</span>
              </div>
            </div>
            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-2 p-0.5 border border-white/5">
              {[1,2,3,4,5,6,7].map(i => (
                <div key={i} className={`h-full flex-1 rounded-full transition-all duration-1000 ease-out ${i <= 5 ? 'bg-primary shadow-[0_0_15px_rgba(19,109,236,0.6)]' : 'bg-white/5'}`} />
              ))}
            </div>
            <p className="text-[9px] text-slate-500 mt-5 font-black uppercase tracking-[0.2em] opacity-40">Spirit Goal: 21 Days Journey</p>
          </section>

          <div className="w-full grid grid-cols-3 gap-5">
            {[
              { label: 'Treasury', val: savedItems.length.toString(), icon: 'bookmark' },
              { label: 'Scrolls', val: prayers.length.toString(), icon: 'history_edu' },
              { label: 'Wisdom', val: '4', icon: 'military_tech' },
            ].map(stat => (
              <div key={stat.label} className="bg-surface-dark/50 border border-white/5 p-7 rounded-[32px] flex flex-col items-center gap-3 shadow-xl hover:border-primary/30 transition-all cursor-default active:scale-95">
                <span className="material-symbols-outlined text-primary text-xl">{stat.icon}</span>
                <p className="text-xl font-bold text-white leading-none">{stat.val}</p>
                <p className="text-[9px] uppercase font-black text-slate-500 tracking-[0.2em]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 px-6">
          <div className="flex bg-surface-dark/30 border border-white/5 rounded-full p-2 shadow-inner">
            <button 
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] rounded-full transition-all duration-500 ${activeTab === 'saved' ? 'bg-primary text-white shadow-[0_10px_30px_rgba(19,109,236,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              The Sanctuary
            </button>
            <button 
              onClick={() => setActiveTab('journal')}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] rounded-full transition-all duration-500 ${activeTab === 'journal' ? 'bg-primary text-white shadow-[0_10px_30px_rgba(19,109,236,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              The Journal
            </button>
          </div>
        </div>

        <div className="p-8 pb-32">
          {activeTab === 'saved' ? (
            <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {savedItems.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onSelectSaved(item)}
                  className="aspect-square rounded-[40px] bg-surface-dark border border-white/5 flex flex-col justify-end p-8 relative overflow-hidden active:scale-95 transition-all group shadow-2xl hover:border-primary/40 hover:shadow-primary/5"
                >
                  <div className="absolute top-6 right-6 z-10 text-slate-600 group-hover:text-primary transition-all group-hover:scale-110">
                    <span className="material-symbols-outlined text-xl">more_vert</span>
                  </div>
                  <div className="absolute -top-12 -right-12 size-40 bg-primary/5 rounded-full blur-[50px] group-hover:bg-primary/10 transition-colors duration-700"></div>
                  <div className="space-y-2 relative z-10">
                    <p className="text-white text-xs font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">{item.title}</p>
                    <p className="text-primary text-[9px] font-black uppercase tracking-[0.3em] opacity-60">{item.bibleVerse}</p>
                  </div>
                </div>
              ))}
              {savedItems.length === 0 && (
                <div className="col-span-2 py-24 text-center space-y-6 opacity-20">
                  <div className="size-24 bg-surface-dark rounded-full mx-auto flex items-center justify-center border border-white/5 shadow-inner">
                    <span className="material-symbols-outlined text-5xl">bookmark_add</span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em]">Treasury Empty</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex gap-4">
                <button 
                  onClick={handleAddJournal}
                  className="flex-1 bg-primary text-white font-black uppercase tracking-[0.3em] py-6 rounded-[32px] flex items-center justify-center gap-3 text-[10px] active:scale-95 transition-all shadow-3xl shadow-primary/30 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="material-symbols-outlined text-lg">edit_square</span>
                  Write Reflection
                </button>
                <button 
                  onClick={() => navigate('/chat')}
                  className="size-20 bg-surface-dark border border-white/5 text-slate-400 rounded-[32px] flex items-center justify-center active:scale-95 transition-all shadow-xl hover:text-primary hover:border-primary/20"
                >
                  <span className="material-symbols-outlined text-2xl">forum</span>
                </button>
              </div>

              <div className="space-y-6">
                {prayers.map(prayer => (
                  <div 
                    key={prayer.id} 
                    className={`bg-surface-dark/40 backdrop-blur-md border p-8 rounded-[40px] space-y-6 relative overflow-hidden transition-all duration-1000 ${newEntryId === prayer.id ? 'border-primary ring-2 ring-primary/20 shadow-[0_30px_60px_-15px_rgba(19,109,236,0.3)] scale-[1.03]' : 'border-white/5 shadow-xl'}`}
                  >
                    {newEntryId === prayer.id && (
                      <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
                    )}
                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-3">
                        <div className={`size-3 rounded-full ${newEntryId === prayer.id ? 'bg-primary animate-ping' : 'bg-slate-700'}`}></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Grace Received</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-bold tracking-tight bg-white/5 px-3 py-1 rounded-full">{prayer.date}</span>
                    </div>
                    <p className="text-slate-200 text-lg italic font-display leading-[1.8] relative z-10 whitespace-pre-wrap">"{prayer.text}"</p>
                    <div className="flex justify-end relative z-10 pt-2 opacity-20">
                      <span className="material-symbols-outlined text-primary">auto_stories</span>
                    </div>
                  </div>
                ))}
                {prayers.length === 0 && (
                  <div className="py-24 text-center space-y-6 opacity-20">
                    <div className="size-24 bg-surface-dark rounded-full mx-auto flex items-center justify-center border border-white/5 shadow-inner">
                      <span className="material-symbols-outlined text-5xl">history_edu</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">Scrolls Unwritten</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfileScreen;
