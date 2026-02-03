
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneratedContent } from '../types';

interface Props {
  content: GeneratedContent | null;
}

const PreviewScreen: React.FC<Props> = ({ content }) => {
  const navigate = useNavigate();

  const handleShare = async () => {
    if (!content) return;
    const shareText = `🕊️ Devotional: ${content.title}\n📖 Scripture: ${content.bibleVerse}\n\n${content.devotionalMessage}\n\nVia DevotionalAI`;
    if (navigator.share) {
      try {
        await navigator.share({ title: content.title, text: shareText, url: window.location.href });
      } catch (err) { console.debug('Share failed:', err); }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard!');
    }
  };

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-background-dark">
        <span className="material-symbols-outlined text-slate-700 text-6xl mb-4">menu_book</span>
        <button onClick={() => navigate('/home')} className="bg-primary text-white px-10 py-3 rounded-xl font-bold text-sm">Return Home</button>
      </div>
    );
  }

  const isVideo = !!content.videoScript;

  return (
    <div className="flex flex-col min-h-screen bg-background-dark pb-32">
      <header className="sticky top-0 z-50 glass flex items-center p-4 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="text-white flex size-10 items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-base font-bold flex-1 text-center font-jakarta">Scripture Feed</h2>
        <button onClick={handleShare} className="text-primary flex size-10 items-center justify-center">
          <span className="material-symbols-outlined">share</span>
        </button>
      </header>

      <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {isVideo ? (
          <section className="aspect-video bg-black flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1518111267439-094776100c5c?q=80&w=800&auto=format&fit=crop')` }}></div>
            <button className="size-20 rounded-full glass border border-white/20 flex items-center justify-center text-white relative z-10 transition-transform active:scale-90 shadow-2xl">
              <span className="material-symbols-outlined text-5xl fill-current ml-1">play_circle</span>
            </button>
          </section>
        ) : (
          <div className="h-64 bg-surface-dark overflow-hidden relative">
             <img src="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-50" alt="header" />
             <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent"></div>
          </div>
        )}

        <div className="px-6 -mt-12 relative z-10 space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold font-jakarta text-white tracking-tight">{content.title}</h1>
            <p className="text-primary text-[10px] font-black uppercase tracking-widest bg-primary/10 w-fit px-3 py-1 rounded-full">{content.bibleVerse}</p>
          </div>

          <div className="bg-surface-dark border border-white/5 p-8 rounded-2xl shadow-xl">
            <p className="text-slate-200 leading-relaxed font-display text-xl italic whitespace-pre-wrap">
              {content.devotionalMessage}
            </p>
          </div>

          <section className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Reflection Guidance</h3>
              <div className="bg-surface-dark border border-white/5 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm leading-relaxed">{content.practicalApplication}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Daily Challenge</h3>
              <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
                <p className="text-white font-bold text-base">{content.callToAction}</p>
              </div>
            </div>
          </section>

          {/* Related Content Section */}
          <section className="space-y-6 pt-12 border-t border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Related Studies</h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="shrink-0 w-48 space-y-3 group cursor-pointer">
                  <div className="aspect-[4/5] bg-surface-dark rounded-xl overflow-hidden relative">
                    <img src={`https://picsum.photos/seed/${i + 20}/400/500`} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="related" />
                  </div>
                  <h4 className="text-white font-bold text-xs line-clamp-2">Exploring the Depths of Grace (Part {i})</h4>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 p-5 pb-10 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="w-full bg-primary text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg"
        >
          <span className="material-symbols-outlined text-sm">check_circle</span>
          Complete Study
        </button>
      </div>
    </div>
  );
};

export default PreviewScreen;
