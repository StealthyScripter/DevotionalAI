
import React, { useState, useRef, useEffect } from 'react';
import { Theme, Format, Audience, Style, Length, GeneratedContent } from '../types';
import { generateDevotional } from '../geminiService';
import { useNavigate } from 'react-router-dom';

interface Props {
  onGenerate: (content: GeneratedContent) => void;
}

const themeIcons: Record<Theme, string> = {
  [Theme.Hope]: 'brightness_5',
  [Theme.Anxiety]: 'air',
  [Theme.Courage]: 'shield',
  [Theme.Faith]: 'star',
  [Theme.Healing]: 'spa',
  [Theme.Wisdom]: 'menu_book',
  [Theme.Strength]: 'bolt',
  [Theme.Love]: 'favorite',
};

const GenerateScreen: React.FC<Props> = ({ onGenerate }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [verse, setVerse] = useState('');
  const [format, setFormat] = useState<Format | "">("");
  const [length, setLength] = useState<Length>(Length.Short);
  const [audience, setAudience] = useState<Audience>(Audience.Adults);
  const [style, setStyle] = useState<Style>(Style.Inspirational);
  const [showValidation, setShowValidation] = useState(false);

  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);

  const steps = [
    "Consulting the Holy Word...",
    "Finding specific scriptures...",
    "Drafting your personalized message...",
    "Synthesizing spiritual guidance...",
    "Finalizing for publication..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setProgress(prev => Math.min(prev + (100 / (steps.length * 4)), 98));
        setLoadingStep(prev => {
           const next = prev + (Math.random() > 0.7 ? 1 : 0);
           return Math.min(next, steps.length - 1);
        });
      }, 800);
    } else {
      setProgress(0);
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!theme || !format) {
      setShowValidation(true);
      if (!theme) step1Ref.current?.scrollIntoView({ behavior: 'smooth' });
      else if (!format) step2Ref.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      const content = await generateDevotional(theme, verse, format as Format, length, audience, style);
      setProgress(100);
      setTimeout(() => onGenerate(content), 500);
    } catch (err) {
      console.error(err);
      alert('Failed to generate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark pb-44">
      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background-dark/95 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative flex items-center justify-center mb-16">
            <div className="absolute size-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute size-44 border-2 border-primary/20 rounded-full animate-spin-slow"></div>
            <div className="absolute size-52 border border-white/5 rounded-full animate-spin-slow [animation-direction:reverse]"></div>
            <div className="size-28 rounded-full bg-primary flex items-center justify-center text-white shadow-2xl glowing-button relative z-10 animate-float">
              <span className="material-symbols-outlined text-5xl">auto_awesome</span>
            </div>
          </div>
          
          <div className="text-center space-y-6 px-12 relative z-10 w-full max-w-xs">
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-jakarta text-white tracking-tight animate-in slide-in-from-bottom-2 duration-700">
                {steps[loadingStep]}
              </h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Prophetic Intelligence Engine</p>
            </div>
            
            <div className="space-y-3">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(19,109,236,0.5)]" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">
                <span>Phase {loadingStep + 1}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 glass border-b border-white/5 p-4 flex items-center justify-between">
        <button onClick={() => navigate('/home')} className="text-white flex size-10 items-center justify-center rounded-full hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="text-sm font-black uppercase tracking-[0.2em] font-jakarta">Devotional Studio</h2>
        <div className="w-10"></div>
      </header>

      <main className="p-6 space-y-12 max-w-md mx-auto w-full mt-6">
        {/* Theme Selection */}
        <section ref={step1Ref} className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <span className="text-[10px] font-black bg-primary text-white size-6 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">1</span>
            <h3 className="text-white font-bold text-lg">Select Theme</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.values(Theme).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border transition-all active:scale-95 group ${
                  theme === t 
                    ? 'bg-primary border-primary text-white shadow-2xl shadow-primary/30' 
                    : 'bg-surface-dark border-white/5 text-slate-500 hover:border-white/20'
                }`}
              >
                <span className={`material-symbols-outlined text-2xl transition-transform ${theme === t ? 'scale-110' : 'group-hover:scale-110'}`}>{themeIcons[t]}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{t}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Medium Selection */}
        <section ref={step2Ref} className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <span className="text-[10px] font-black bg-primary text-white size-6 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">2</span>
            <h3 className="text-white font-bold text-lg">Select Medium</h3>
          </div>
          <div className="space-y-3">
            <div className="relative group">
              <select 
                value={format}
                onChange={(e) => setFormat(e.target.value as Format)}
                className="w-full bg-surface-dark border-white/5 rounded-2xl text-white text-sm py-5 px-6 outline-none focus:ring-2 focus:ring-primary appearance-none border transition-all hover:border-white/20"
              >
                <option value="" disabled>Where is this going?</option>
                {Object.values(Format).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-primary transition-colors">unfold_more</span>
            </div>
          </div>
        </section>

        {/* Optional Context */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <span className="text-[10px] font-black bg-slate-800 text-slate-500 size-6 rounded-full flex items-center justify-center border border-white/5">3</span>
            <h3 className="text-white font-bold text-lg">Scripture & Voice</h3>
          </div>
          <div className="space-y-4">
            <div className="relative group">
              <input 
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                className="w-full px-6 py-5 bg-surface-dark border-white/5 border rounded-2xl text-sm focus:ring-2 focus:ring-primary text-white outline-none transition-all hover:border-white/20" 
                placeholder="Specific Verse (Optional)" 
              />
              <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-600">menu_book</span>
            </div>
            <div className="flex gap-2 p-1.5 bg-surface-dark rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
              {Object.values(Style).map(s => (
                <button 
                  key={s} 
                  onClick={() => setStyle(s)}
                  className={`flex-1 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${style === s ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 p-4 pb-12 z-50">
        <div className="max-w-md mx-auto">
          {showValidation && (!theme || !format) && (
            <p className="text-red-500 text-[10px] font-black uppercase text-center mb-4 tracking-widest animate-pulse">Select Theme & Medium to proceed</p>
          )}
          <button 
            disabled={loading}
            onClick={handleGenerate}
            className="w-full bg-primary text-white font-black uppercase tracking-[0.2em] py-6 rounded-2xl shadow-2xl shadow-primary/40 active:scale-95 transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
          >
            {loading ? <span className="animate-spin material-symbols-outlined">sync</span> : (
              <>
                <span>Invoke AI Pastor</span>
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">auto_awesome</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateScreen;
