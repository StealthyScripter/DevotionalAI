import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailyVerse } from '../content/spiritualContent';
import { storageService } from '../storageService';

const MeditationScreen: React.FC = () => {
  const navigate = useNavigate();
  const [, setDataVersion] = useState(0);
  const verse = getDailyVerse();

  useEffect(() => {
    void storageService.syncData().finally(() => setDataVersion((v) => v + 1));
  }, []);

  const shareMeditation = async () => {
    const text = `Daily Meditation\n${verse.ref}\n\n${verse.verse}`;
    if (navigator.share) {
      await navigator.share({ title: 'Daily Meditation', text, url: window.location.href });
      return;
    }
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <img src={verse.imageUrl} alt="Meditation visual" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />

      <header className="relative z-20 flex items-center justify-between p-5">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <button onClick={shareMeditation} className="flex size-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm">
          <span className="material-symbols-outlined">share</span>
        </button>
      </header>

      <main className="relative z-20 flex min-h-[calc(100vh-80px)] items-center justify-center p-7">
        <article className="w-full max-w-sm rounded-[32px] border border-white/20 bg-black/30 p-7 text-center backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Daily Meditation</p>
          <p className="mt-4 text-2xl italic leading-snug text-white">"{verse.verse}"</p>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/75">{verse.ref}</p>
        </article>
      </main>
    </div>
  );
};

export default MeditationScreen;
