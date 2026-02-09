
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneratedContent, Format } from '../types';
import { storageService } from '../storageService';

interface Props {
  content: GeneratedContent | null;
}

const PreviewScreen: React.FC<Props> = ({ content }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content) {
      setIsSaved(storageService.isSaved(content));
    }
  }, [content]);

  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-primary text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(19,109,236,0.5)] z-[200] animate-in slide-in-from-bottom-4 fade-in duration-500 flex items-center gap-3';
    toast.innerHTML = `<span class="material-symbols-outlined text-sm">verified</span> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-4');
      setTimeout(() => toast.remove(), 500);
    }, 2500);
  };

  const handleSave = () => {
    if (!content || saving) return;
    setSaving(true);
    storageService.saveDevotional(content);
    
    // Simulate spiritual preservation delay
    setTimeout(() => {
      setIsSaved(true);
      setSaving(false);
      showToast('Chronicle Preserved');
      setShowMenu(false);
    }, 600);
  };

  const handleShare = async () => {
    if (!content) return;
    const shareText = `🕊️ Study: ${content.title}\n📖 Word: ${content.bibleVerse}\n\n${content.devotionalMessage}\n\nShared from DevotionalAI`;
    if (navigator.share) {
      try {
        await navigator.share({ title: content.title, text: shareText, url: window.location.href });
      } catch (err) { console.debug('Share failed:', err); }
    } else {
      await navigator.clipboard.writeText(shareText);
      showToast('Word Copied');
    }
    setShowMenu(false);
  };

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-background-dark">
        <div className="size-20 bg-surface-dark rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
          <span className="material-symbols-outlined text-slate-700 text-4xl">menu_book</span>
        </div>
        <h3 className="text-white font-bold mb-4 font-jakarta">Tabernacle Empty</h3>
        <button onClick={() => navigate('/home')} className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">Return Home</button>
      </div>
    );
  }

  const isVideo = !!content.videoScript || !!content.videoUrl;
  const isSermon = content.format === Format.SermonNotes || content.devotionalMessage.length > 500;
  const isSMS = content.format === Format.SMS;

  return (
    <div className="flex flex-col min-h-screen bg-background-dark pb-48 selection:bg-primary/40">
      <header className="sticky top-0 z-[60] glass flex items-center p-5 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="text-white flex size-10 items-center justify-center rounded-xl hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1 flex flex-col items-center">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] font-jakarta opacity-40">Spiritual Study</h2>
          <span className="text-[9px] text-primary font-black uppercase tracking-[0.4em] mt-1">{isSermon ? 'Exegesis' : 'Manna'}</span>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-white flex size-10 items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setShowMenu(false)}></div>
              <div className="absolute right-0 mt-3 w-64 glass border border-white/10 rounded-[32px] shadow-3xl py-3 z-[70] animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={handleSave}
                  className="w-full flex items-center gap-4 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 text-left transition-colors"
                >
                  <span className={`material-symbols-outlined text-lg ${isSaved ? 'text-primary fill-current' : 'text-slate-400'}`}>
                    {isSaved ? 'bookmark_added' : 'bookmark'}
                  </span>
                  {isSaved ? 'Saved to Library' : 'Add to Treasury'}
                </button>
                <button 
                  onClick={handleShare}
                  className="w-full flex items-center gap-4 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-lg text-slate-400">share</span>
                  Spread the Word
                </button>
                <div className="mx-6 my-2 h-px bg-white/5"></div>
                <button 
                  onClick={() => {
                    navigate('/chat');
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-4 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">church</span>
                  Seek AI Counsel
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="animate-in fade-in slide-in-from-bottom-6 duration-700">
        {content.videoUrl ? (
           <section className="aspect-video bg-black flex items-center justify-center relative shadow-3xl">
              <video src={content.videoUrl} controls autoPlay className="w-full h-full object-contain" />
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3 py-1.5 bg-primary/80 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20">Veo AI Motion</span>
              </div>
           </section>
        ) : isVideo ? (
          <section className="aspect-video bg-surface-dark flex items-center justify-center relative group overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-cover bg-center opacity-40 grayscale-[0.3] transition-transform duration-[10s] group-hover:scale-110" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop')` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
            <button className="size-20 rounded-full glass border border-white/20 flex items-center justify-center text-white relative z-10 transition-transform active:scale-90 shadow-3xl hover:scale-110 group-hover:bg-primary transition-all">
              <span className="material-symbols-outlined text-5xl fill-current ml-1">play_arrow</span>
            </button>
          </section>
        ) : (
          <div className="h-72 bg-surface-dark overflow-hidden relative shadow-2xl">
             <img src="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover opacity-50 grayscale-[0.2] animate-pulse-gentle" alt="header" />
             <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent"></div>
          </div>
        )}

        <div className={`px-8 relative z-10 space-y-12 ${isSermon ? 'mt-10' : '-mt-20'}`}>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] bg-primary/10 px-5 py-2.5 rounded-full border border-primary/20 shadow-[0_10px_20px_rgba(19,109,236,0.1)]">{content.format || 'Holy Word'}</span>
               {isSaved && <div className="size-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(19,109,236,0.8)]"></div>}
            </div>
            <h1 className={`${isSermon ? 'text-[42px]' : 'text-[36px]'} font-bold font-jakarta text-white tracking-tight leading-[1.1] drop-shadow-2xl`}>{content.title}</h1>
            <div className="flex items-center gap-4 text-slate-500">
              <div className="h-px w-8 bg-slate-800"></div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">{content.bibleVerse}</p>
            </div>
          </div>

          <div className={`relative ${isSMS ? 'max-w-[85%] mr-auto' : ''}`}>
             <div className={`${
               isSermon 
                 ? 'bg-transparent border-l-4 border-primary/20 pl-10' 
                 : isSMS 
                   ? 'bg-surface-dark/60 backdrop-blur-xl border border-white/5 p-8 rounded-[40px] rounded-tl-none shadow-3xl'
                   : 'bg-surface-dark/50 backdrop-blur-xl border border-white/5 p-12 rounded-[56px] shadow-3xl'
             }`}>
               <p className={`text-slate-200 leading-[2] font-display ${isSermon ? 'text-2xl font-light text-justify' : 'text-2xl italic font-medium'} whitespace-pre-wrap`}>
                 {content.devotionalMessage}
               </p>
             </div>
             {isSMS && <div className="mt-2 ml-4 flex items-center gap-1.5 opacity-30">
                <span className="material-symbols-outlined text-[10px] fill-current">history</span>
                <span className="text-[9px] font-black uppercase tracking-widest">Sent from the Sanctuary</span>
             </div>}
          </div>

          <section className="grid grid-cols-1 gap-14 pt-6">
            <div className="space-y-5">
              <div className="flex items-center gap-4 px-2">
                 <div className="size-12 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-500 border border-white/5 shadow-inner">
                   <span className="material-symbols-outlined text-2xl">lightbulb</span>
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Living Insight</h3>
              </div>
              <div className="bg-surface-dark/30 border border-white/5 p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 p-4 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-700">
                  <span className="material-symbols-outlined text-6xl">format_quote</span>
                </div>
                <p className="text-slate-400 text-lg leading-relaxed italic font-medium relative z-10">"{content.practicalApplication}"</p>
              </div>
            </div>

            <div className="space-y-5">
               <div className="flex items-center gap-4 px-2">
                 <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/10">
                   <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Divine Action</h3>
              </div>
              <div className="bg-primary/5 border border-primary/20 p-12 rounded-[48px] relative overflow-hidden group shadow-[0_20px_50px_rgba(19,109,236,0.05)]">
                <div className="absolute -top-10 -right-10 size-48 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-1000"></div>
                <p className="text-white font-bold text-2xl leading-snug relative z-10 font-jakarta">{content.callToAction}</p>
                <div className="mt-8 flex justify-end relative z-10">
                  <span className="material-symbols-outlined text-primary text-3xl animate-bounce-subtle">arrow_forward</span>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-8 pt-20 pb-16 border-t border-white/5">
            <div className="flex items-center justify-between px-2">
              <div className="space-y-1">
                <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500">Eternal Ties</h3>
                <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Related Wisdom & Scrolls</p>
              </div>
              <button className="text-[10px] text-primary font-black uppercase tracking-widest bg-primary/10 px-5 py-2 rounded-full border border-primary/20 active:scale-95 transition-all">Explore All</button>
            </div>
            <div className="flex gap-6 overflow-x-auto no-scrollbar -mx-8 px-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="shrink-0 w-64 space-y-5 group cursor-pointer active:scale-95 transition-all">
                  <div className="aspect-[3/4] bg-surface-dark rounded-[48px] overflow-hidden relative border border-white/5 shadow-3xl">
                    <img src={`https://images.unsplash.com/photo-${1510000000000 + (i*1234)}?q=80&w=400&auto=format&fit=crop`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-50" alt="related" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                       <p className="text-white font-bold text-base line-clamp-2 leading-tight drop-shadow-md">The Path of the Holy Spirit (Part {i})</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 p-6 pb-16 z-50 flex flex-col gap-4 max-w-md mx-auto">
        {!isSaved && (
          <button 
            onClick={handleSave}
            disabled={saving}
            className={`w-full bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.4em] py-6 rounded-[28px] flex items-center justify-center gap-4 active:scale-95 transition-all hover:bg-white/10 group shadow-2xl ${saving ? 'opacity-50' : ''}`}
          >
            {saving ? (
              <span className="animate-spin material-symbols-outlined text-primary">sync</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg group-hover:scale-125 transition-transform group-hover:text-primary">bookmark</span>
                Sanctify & Save
              </>
            )}
          </button>
        )}
        <button 
          onClick={() => navigate(-1)}
          className="w-full bg-primary text-white font-black uppercase tracking-[0.4em] py-6 rounded-[28px] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-3xl shadow-primary/40 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer"></div>
          <span className="material-symbols-outlined text-lg">check_circle</span>
          Complete Meditation
        </button>
      </div>
    </div>
  );
};

export default PreviewScreen;
