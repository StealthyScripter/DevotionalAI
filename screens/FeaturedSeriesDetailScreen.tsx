import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFeaturedSeriesById } from '../content/spiritualContent';
import { storageService } from '../storageService';

const FeaturedSeriesDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const [, setDataVersion] = useState(0);
  const { seriesId } = useParams();
  const series = getFeaturedSeriesById(seriesId);

  useEffect(() => {
    void storageService.syncData().finally(() => setDataVersion((v) => v + 1));
  }, []);

  if (!series) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">Series Not Found</p>
        <button onClick={() => navigate('/featured-series')} className="rounded-2xl bg-primary px-6 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white">
          Back to Series
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark pb-24">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 p-4 glass">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-xl text-white hover:bg-white/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Series Detail</h2>
        <div className="w-10" />
      </header>

      <main className="mx-auto w-full max-w-md space-y-8 px-4 pt-6">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10">
          <div className="aspect-[4/5]">
            <img src={series.coverImageUrl} alt={series.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/35" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Featured Series</p>
              <h1 className="text-4xl font-bold leading-tight text-white">{series.title}</h1>
              <p className="text-sm text-slate-200">{series.description}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">{series.host} • {series.cadence}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Episodes</h3>
          {series.episodes.map((episode) => (
            <button
              key={episode.id}
              onClick={() => navigate(`/featured-series/${series.id}/${episode.id}`)}
              className="flex w-full items-center gap-4 rounded-[24px] border border-white/10 bg-surface-dark/50 p-4 text-left transition-all hover:border-white/20 active:scale-[0.98]"
            >
              <div className="size-16 overflow-hidden rounded-xl border border-white/10">
                <img src={episode.imageUrl} alt={episode.title} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{episode.title}</p>
                <p className="mt-1 line-clamp-1 text-xs text-slate-400">{episode.summary}</p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">{episode.scripture} • {episode.duration}</p>
              </div>
              <span className="material-symbols-outlined text-slate-500">chevron_right</span>
            </button>
          ))}
          {series.episodes.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-surface-dark/40 p-8 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">No episodes yet</p>
              <p className="mt-3 text-xs text-slate-400">Admin publishing will add episodes to this series.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default FeaturedSeriesDetailScreen;
