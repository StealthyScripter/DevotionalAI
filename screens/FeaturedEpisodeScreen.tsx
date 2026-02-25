import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFeaturedSeriesById, getFeaturedSeriesEpisode } from '../content/spiritualContent';
import { storageService } from '../storageService';

const FeaturedEpisodeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [, setDataVersion] = useState(0);
  const { seriesId, episodeId } = useParams();
  const series = getFeaturedSeriesById(seriesId);
  const episode = getFeaturedSeriesEpisode(seriesId, episodeId);

  useEffect(() => {
    void storageService.syncData().finally(() => setDataVersion((v) => v + 1));
  }, []);

  if (!series || !episode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">Episode Not Found</p>
        <button onClick={() => navigate('/featured-series')} className="rounded-2xl bg-primary px-6 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white">
          Back to Series
        </button>
      </div>
    );
  }

  const shareEpisode = async () => {
    const shareText = `${series.title} - ${episode.title}\n${episode.scripture}\n\n${episode.content}`;
    if (navigator.share) {
      await navigator.share({ title: episode.title, text: shareText, url: window.location.href });
      return;
    }
    await navigator.clipboard.writeText(shareText);
  };

  return (
    <div className="min-h-screen bg-background-dark pb-24">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 p-4 glass">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-xl text-white hover:bg-white/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Episode</h2>
        <button onClick={shareEpisode} className="flex size-10 items-center justify-center rounded-xl text-white hover:bg-white/5">
          <span className="material-symbols-outlined">share</span>
        </button>
      </header>

      <main className="mx-auto w-full max-w-md space-y-8 px-4 pt-6">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10">
          <div className="aspect-[4/5]">
            <img src={episode.imageUrl} alt={episode.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{series.title}</p>
              <h1 className="text-3xl font-bold leading-tight text-white">{episode.title}</h1>
              <p className="text-sm text-slate-200">{episode.summary}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/80">{episode.scripture} • {episode.duration}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-surface-dark/55 p-7">
          <p className="text-xl italic leading-[1.9] text-slate-100">{episode.content}</p>
        </section>
      </main>
    </div>
  );
};

export default FeaturedEpisodeScreen;
