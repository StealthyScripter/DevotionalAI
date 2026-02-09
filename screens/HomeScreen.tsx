
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneratedContent, Role, Format } from '../types';
import { authService } from '../authService';

interface Props {
  onViewMessage: (content: GeneratedContent) => void;
}

type FeedItemType = 'message' | 'video' | 'image' | 'sermon';

interface FeedItem {
  id: string;
  type: FeedItemType;
  format: Format;
  title: string;
  subtitle?: string;
  content?: string;
  imgUrl: string;
  duration?: string;
  category: string;
}

const HomeScreen: React.FC<Props> = ({ onViewMessage }) => {
  const navigate = useNavigate();
  const session = authService.getSession();
  const userName = session?.user.email.split('@')[0] || 'Friend';
  const isAdmin = session?.user.role === Role.Admin;

  const dailyVerse = {
    verse: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures.",
    ref: "Psalm 23:1-2",
    img: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=800&auto=format&fit=crop"
  };

  const feedItems: FeedItem[] = [
    {
      id: '1',
      type: 'message',
      format: Format.SMS,
      category: 'Daily Bread',
      title: "Your Identity is in Christ",
      content: "You are not defined by your mistakes or your successes, but by the reckless love of a Father who called you His own before the world began.",
      imgUrl: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: '2',
      type: 'video',
      format: Format.VideoScript,
      category: 'Video Reflection',
      title: "Walking on Water",
      subtitle: "Finding courage in the middle of your biggest storm.",
      duration: '4:20',
      imgUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: '3',
      type: 'image',
      format: Format.ImagePrompt,
      category: 'Meditation',
      title: "Quiet Spirit",
      imgUrl: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: '4',
      type: 'sermon',
      format: Format.SermonNotes,
      category: 'Sunday Message',
      title: "The Architecture of Grace",
      subtitle: "A deep dive into the book of Romans and the radical nature of God's forgiveness.",
      duration: '22 min read',
      imgUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=600&auto=format&fit=crop',
    }
  ];

  const handleCardClick = (item: FeedItem) => {
    onViewMessage({
      title: item.title,
      bibleVerse: item.category === 'Daily Bread' ? 'Ephesians 2:10' : 'Various Scriptures',
      devotionalMessage: item.content || item.subtitle || "A deep spiritual exploration awaits...",
      practicalApplication: "Reflect on this message during your quiet time today.",
      callToAction: "Apply this wisdom to your current situation.",
      format: item.format,
      videoScript: item.type === 'video' ? {
        hook: "Ever feel like you're sinking?",
        body: item.subtitle || "",
        cta: "Step out in faith.",
        visuals: "Ocean waves at night.",
        audio: "Soft ambient worship music."
      } : undefined
    });
  };

  return (
    <div className="flex flex-col min-h-screen pb-40">
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="flex items-center p-4 justify-between max-w-md mx-auto">
          <div className="flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-black mb-0.5">Shalom</p>
            <h2 className="text-white text-xl font-bold tracking-tight font-jakarta capitalize">Hello, {userName}</h2>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={() => navigate('/admin')} className="flex size-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
              </button>
            )}
            <button onClick={() => navigate('/settings')} className="flex size-10 items-center justify-center rounded-full bg-surface-dark border border-border-dark text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-8 pt-6 max-w-md mx-auto w-full">
        {/* Hero Card */}
        <section 
          className="relative group flex flex-col items-stretch justify-end rounded-[32px] pt-64 shadow-2xl overflow-hidden aspect-[4/5] animate-in fade-in duration-700 cursor-pointer transition-transform active:scale-[0.98]"
          onClick={() => handleCardClick({ id: 'hero', type: 'message', format: Format.SMS, title: 'Verse of the Day', category: 'Daily Bread', content: dailyVerse.verse, imgUrl: dailyVerse.img })}
        >
          <img src={dailyVerse.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" alt="Daily Verse" />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent"></div>
          <div className="absolute top-6 left-6 flex items-center justify-between right-6 z-20">
             <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                <p className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
                  Featured Word
                </p>
             </div>
             <button className="size-8 rounded-full glass border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
               <span className="material-symbols-outlined text-lg">more_vert</span>
             </button>
          </div>
          <div className="flex w-full flex-col gap-3 p-8 relative z-10 transition-transform duration-500 group-hover:-translate-y-2">
            <p className="text-white font-display text-2xl italic leading-snug">"{dailyVerse.verse}"</p>
            <p className="text-white/40 font-sans text-[10px] font-black tracking-[0.3em] uppercase">{dailyVerse.ref}</p>
          </div>
        </section>

        {/* Spiritual Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Spiritual Feed</h3>
            <button onClick={() => navigate('/discover')} className="text-[10px] text-primary font-black uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-all">Explore All</button>
          </div>

          {feedItems.map((item) => (
            <div key={item.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative group">
              {/* Devotional Card */}
              {item.type === 'message' && (
                <div 
                  className="bg-primary p-8 rounded-[24px] shadow-2xl shadow-primary/20 relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
                  onClick={() => handleCardClick(item)}
                >
                  <div className="absolute -top-10 -right-10 size-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">{item.category}</p>
                    <button className="text-white/40 hover:text-white transition-colors z-20">
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                  </div>
                  <h4 className="text-white font-display text-2xl font-bold mb-4 leading-tight">{item.title}</h4>
                  <p className="text-white/90 text-base leading-relaxed italic line-clamp-3">"{item.content}"</p>
                </div>
              )}

              {/* Video Reflection Card */}
              {item.type === 'video' && (
                <div 
                  className="bg-surface-dark border border-white/5 rounded-[24px] overflow-hidden group cursor-pointer active:scale-95 transition-all shadow-xl hover:border-white/10"
                  onClick={() => handleCardClick(item)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img src={item.imgUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80" alt={item.title} />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
                       <div className="size-14 rounded-full glass border border-white/20 flex items-center justify-center text-white relative shadow-2xl transform transition-transform group-hover:scale-110">
                         <span className="material-symbols-outlined text-3xl fill-current ml-1">play_arrow</span>
                       </div>
                    </div>
                    <div className="absolute top-4 right-4 z-20">
                      <button className="size-8 rounded-full glass border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                      <span className="text-white text-[10px] font-bold">{item.duration}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-primary text-sm">videocam</span>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{item.category}</p>
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">{item.title}</h4>
                    <p className="text-slate-500 text-xs line-clamp-1">{item.subtitle}</p>
                  </div>
                </div>
              )}

              {/* Meditation Image Card */}
              {item.type === 'image' && (
                <div 
                  className="relative aspect-square rounded-[24px] overflow-hidden group cursor-pointer active:scale-95 transition-all shadow-xl"
                  onClick={() => handleCardClick(item)}
                >
                  <img src={item.imgUrl} className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 opacity-70" alt={item.title} />
                  <div className="absolute top-4 right-4 z-20">
                    <button className="size-8 rounded-full glass border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent opacity-90 p-8 flex flex-col justify-end">
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{item.category}</p>
                    <h4 className="text-white font-display text-3xl font-bold italic">{item.title}</h4>
                  </div>
                </div>
              )}

              {/* Sermon Card */}
              {item.type === 'sermon' && (
                <div 
                  className="bg-surface-dark border border-white/5 p-8 rounded-[24px] space-y-5 cursor-pointer active:scale-95 transition-all shadow-xl hover:border-white/10 group"
                  onClick={() => handleCardClick(item)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">menu_book</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{item.category}</p>
                      </div>
                      <h4 className="text-white font-bold text-xl font-jakarta group-hover:text-primary transition-colors">{item.title}</h4>
                    </div>
                    <button className="text-slate-600 hover:text-white transition-colors z-20">
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 italic">"{item.subtitle}"</p>
                  <div className="flex items-center justify-between pt-5 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-500 text-sm">schedule</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.duration}</span>
                    </div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Study Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
