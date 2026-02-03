
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

  const handleAddJournal = () => {
    const text = window.prompt("Write your reflection or prayer...");
    if (text && text.trim()) {
      const newEntry: PrayerEntry = {
        id: Date.now(),
        text: text.trim(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
      const updated = [newEntry, ...prayers];
      setPrayers(updated);
      localStorage.setItem('devotional_journal', JSON.stringify(updated));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark pb-32">
      <header className="sticky top-0 z-50 glass flex items-center p-4 justify-between border-b border-white/5">
        <button onClick={() => navigate('/settings')} className="text-white flex size-10 items-center justify-center">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <h2 className="text-lg font-bold font-jakarta">Spiritual Profile</h2>
        <div className="w-10"></div>
      </header>

      <main className="pt-6">
        <div className="px-6 flex flex-col items-center">
          <div className="size-24 rounded-full border-2 border-primary/20 bg-cover bg-center mb-4 p-1">
             <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url('https://picsum.photos/seed/${userName}/200/200')` }} />
          </div>
          <h1 className="text-xl font-bold font-jakarta capitalize text-white">{userName}</h1>
          <p className="text-slate-500 text-xs mb-8">{userEmail}</p>
          
          {/* Faith Journey Engagement Tracking */}
          <section className="w-full bg-surface-dark border border-white/5 p-5 rounded-[32px] mb-8">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Faith Journey</p>
                <h3 className="text-white font-bold text-lg">{streakCount} Day Streak</h3>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <span className="material-symbols-outlined fill-current text-xl">local_fire_department</span>
              </div>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
              {[1,2,3,4,5,6,7].map(i => (
                <div key={i} className={`h-full flex-1 rounded-full ${i <= 5 ? 'bg-primary' : 'bg-white/10'}`} />
              ))}
            </div>
            <p className="text-[9px] text-slate-500 mt-3 font-medium">Next milestone: 21 Days of Devotion</p>
          </section>

          <div className="w-full grid grid-cols-3 gap-3">
            {[
              { label: 'Streak', val: `${streakCount}d`, icon: 'local_fire_department' },
              { label: 'Saved', val: savedItems.length.toString(), icon: 'bookmark' },
              { label: 'Reflection', val: prayers.length.toString(), icon: 'edit_note' },
            ].map(stat => (
              <div key={stat.label} className="bg-surface-dark/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-primary text-lg mb-1">{stat.icon}</span>
                <p className="text-sm font-bold text-white">{stat.val}</p>
                <p className="text-[8px] uppercase font-black text-slate-500 tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 px-6">
          <div className="flex border-b border-white/5 bg-white/2 rounded-full p-1">
            <button 
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-2.5 text-[11px] font-bold rounded-full transition-all ${activeTab === 'saved' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500'}`}
            >
              Saved Content
            </button>
            <button 
              onClick={() => setActiveTab('journal')}
              className={`flex-1 py-2.5 text-[11px] font-bold rounded-full transition-all ${activeTab === 'journal' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500'}`}
            >
              Prayer Journal
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'saved' ? (
            <div className="grid grid-cols-2 gap-4">
              {savedItems.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onSelectSaved(item)}
                  className="aspect-square rounded-3xl bg-surface-dark border border-white/5 flex flex-col justify-end p-4 relative overflow-hidden active:scale-95 transition-transform"
                >
                  <div className="absolute top-4 left-4 size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-xs">bookmark</span>
                  </div>
                  <p className="text-white text-[10px] font-bold line-clamp-2 leading-tight">{item.title}</p>
                  <p className="text-slate-500 text-[8px] font-bold uppercase mt-1 tracking-wider">{item.bibleVerse}</p>
                </div>
              ))}
              {savedItems.length === 0 && <p className="col-span-2 text-center text-slate-500 py-10 text-xs italic">Your saved inspirations will appear here.</p>}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Journal Refactored Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={handleAddJournal}
                  className="flex-1 bg-primary/10 border border-primary/20 text-primary font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-xs active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">edit_square</span>
                  Write Reflection
                </button>
                <button 
                  onClick={() => navigate('/chat')}
                  className="size-14 bg-surface-dark border border-white/10 text-slate-400 rounded-2xl flex items-center justify-center active:scale-95 transition-all"
                  title="Ask Pastor"
                >
                  <span className="material-symbols-outlined">forum</span>
                </button>
              </div>

              <div className="pt-4 space-y-4">
                {prayers.map(prayer => (
                  <div key={prayer.id} className="bg-surface-dark border border-white/5 p-5 rounded-3xl space-y-3 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-primary"></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">{prayer.date}</span>
                    </div>
                    <p className="text-slate-300 text-sm italic font-display leading-relaxed">"{prayer.text}"</p>
                  </div>
                ))}
                {prayers.length === 0 && <p className="text-center text-slate-500 py-10 text-xs italic">Start your journey with a daily reflection.</p>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfileScreen;
