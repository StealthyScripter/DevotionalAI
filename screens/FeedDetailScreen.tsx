import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSpiritualFeedItem } from '../content/spiritualContent';
import { storageService } from '../storageService';

const FeedDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const [, setDataVersion] = useState(0);
  const { id } = useParams();
  const item = getSpiritualFeedItem(id);

  useEffect(() => {
    void storageService.syncData().finally(() => setDataVersion((v) => v + 1));
  }, []);

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">Feed Item Not Found</p>
        <button onClick={() => navigate('/home')} className="rounded-2xl bg-primary px-6 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white">
          Back Home
        </button>
      </div>
    );
  }

  const shareItem = async () => {
    const shareText = `${item.title}\n${item.scripture}\n\n${item.content.devotionalMessage}`;
    if (navigator.share) {
      await navigator.share({ title: item.title, text: shareText, url: window.location.href });
      return;
    }
    await navigator.clipboard.writeText(shareText);
  };

  const isImage = item.kind === 'image';
  const isVideo = item.kind === 'video';

  if (isImage) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black">
        <img src={item.imageUrl} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />

        <header className="relative z-20 flex items-center justify-between p-5">
          <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <button onClick={shareItem} className="flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
            <span className="material-symbols-outlined">share</span>
          </button>
        </header>

        <main className="relative z-20 flex min-h-[calc(100vh-80px)] items-center justify-center p-6">
          <article className="w-full max-w-sm rounded-[28px] border border-white/20 bg-black/35 p-6 text-center backdrop-blur-md">
            <p className="text-lg text-white">{item.subtitle}</p>
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary">{item.scripture}</p>
          </article>
        </main>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black">
        {item.videoUrl ? (
          <video src={item.videoUrl} controls autoPlay className="h-screen w-full object-cover" />
        ) : (
          <img src={item.imageUrl} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

        <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-5">
          <button onClick={() => navigate(-1)} className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <button onClick={shareItem} className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
            <span className="material-symbols-outlined">share</span>
          </button>
        </header>

        <main className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-10">
          <article className="rounded-[24px] border border-white/20 bg-black/35 p-5 backdrop-blur-md">
            <p className="text-lg text-white">{item.subtitle}</p>
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary">{item.scripture}</p>
          </article>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 p-4 glass">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-xl text-white hover:bg-white/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Text Reflection</h2>
        <button onClick={shareItem} className="flex size-10 items-center justify-center rounded-xl text-white hover:bg-white/5">
          <span className="material-symbols-outlined">share</span>
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-col gap-8 p-6 pt-10">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.35em] text-primary">{item.scripture}</p>
        <article className="rounded-[28px] border border-white/10 bg-surface-dark/60 p-8">
          <p className="text-2xl leading-[1.8] italic text-slate-100">{item.content.devotionalMessage}</p>
        </article>
      </main>
    </div>
  );
};

export default FeedDetailScreen;
