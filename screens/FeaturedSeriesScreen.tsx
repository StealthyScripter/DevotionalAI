import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFeaturedSeries } from '../content/spiritualContent';
import { storageService } from '../storageService';

const FeaturedSeriesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [, setDataVersion] = useState(0);
  const allSeries = getFeaturedSeries();
  const heroSeries = allSeries[0];

  useEffect(() => {
    void storageService.syncData().finally(() => setDataVersion((v) => v + 1));
  }, []);

  return (
    <div className="min-h-screen bg-background-dark pb-24">
      <header className="sticky top-0 z-50 flex items-center gap-3 border-b border-white/5 p-4 glass">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-xl text-white hover:bg-white/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white">Featured Series</h2>
      </header>

      <main className="mx-auto w-full max-w-md space-y-8 px-4 pt-6">
        {heroSeries && (
          <section
            onClick={() => navigate(`/featured-series/${heroSeries.id}`)}
            className="relative cursor-pointer overflow-hidden rounded-[32px] border border-white/10 shadow-2xl"
          >
            <div className="aspect-[4/5]">
              <img src={heroSeries.coverImageUrl} className="h-full w-full object-cover" alt={heroSeries.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/35" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Featured this week</p>
                <h1 className="text-4xl font-bold leading-tight text-white">{heroSeries.title}</h1>
                <p className="text-sm text-slate-200">{heroSeries.description}</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                {heroSeries.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/80">
                    {tag}
                  </span>
                ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">All Series</h3>
          {allSeries.map((series) => (
            <article
              key={series.id}
              onClick={() => navigate(`/featured-series/${series.id}`)}
              className="overflow-hidden rounded-[28px] border border-white/10 bg-surface-dark/40 transition-all hover:border-white/20 cursor-pointer active:scale-[0.99]"
            >
              <div className="flex gap-4 p-4">
                <div className="h-24 w-20 overflow-hidden rounded-2xl border border-white/10">
                  <img src={series.coverImageUrl} className="h-full w-full object-cover" alt={series.title} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-bold text-white">{series.title}</h4>
                  <p className="text-xs text-slate-400">{series.host}</p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-primary">{series.cadence}</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-white/5 p-4">
                {series.episodes.map((episode) => (
                  <button
                    key={episode.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/featured-series/${series.id}/${episode.id}`);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-background-dark/40 px-4 py-3 text-left transition-colors hover:border-white/15"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{episode.title}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{episode.scripture}</p>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{episode.duration}</p>
                  </button>
                ))}
              </div>
            </article>
          ))}
          {allSeries.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-surface-dark/40 p-8 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">No featured series yet</p>
              <p className="mt-3 text-xs text-slate-400">Admin-published content will automatically form series collections here.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default FeaturedSeriesScreen;
