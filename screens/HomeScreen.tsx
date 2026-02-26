import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Role } from '../types';
import { authService } from '../authService';
import { getDailyVerse, getFeaturedSeries, getSpiritualFeed } from '../content/spiritualContent';
import { storageService } from '../storageService';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [, setDataVersion] = useState(0);
  const session = authService.getSession();
  const userName = session?.user.email.split('@')[0] || 'Friend';
  const isAdmin = session?.user.role === Role.Admin;

  const dailyVerse = getDailyVerse();
  const feedItems = getSpiritualFeed();
  const featuredSeries = getFeaturedSeries();
  const heroSeries = featuredSeries[0];

  useEffect(() => {
    void storageService.syncData().finally(() => setDataVersion((v) => v + 1));
    const onSync = () => setDataVersion((v) => v + 1);
    window.addEventListener('devotional:data-sync', onSync);
    return () => window.removeEventListener('devotional:data-sync', onSync);
  }, []);

  const kindLabelMap = {
    video: 'Video',
    image: 'Image',
    verse: 'Verse',
    sms: 'SMS',
    'short-sermon': 'Short Sermon',
    'long-sermon': 'Long Sermon',
  } as const;

  const openHero = () => {
    navigate('/meditation');
  };

  const createVerseCardBlob = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const image = new Image();
    image.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Image load failed'));
      image.src = dailyVerse.imageUrl;
    });

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, canvas.height * 0.35, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0,0,0,0.15)');
    gradient.addColorStop(1, 'rgba(8, 12, 19, 0.92)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '700 56px Georgia';

    const wrapText = (text: string, maxWidth: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let line = '';

      words.forEach((word) => {
        const testLine = line ? `${line} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth) {
          if (line) lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      });

      if (line) lines.push(line);
      return lines;
    };

    const lines = wrapText(`"${dailyVerse.verse}"`, 830);
    let y = 760;
    lines.forEach((line) => {
      ctx.fillText(line, canvas.width / 2, y);
      y += 74;
    });

    ctx.font = '700 32px Arial';
    ctx.fillStyle = '#8cc6ff';
    ctx.fillText(dailyVerse.ref.toUpperCase(), canvas.width / 2, y + 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 22px Arial';
    ctx.fillText('Shared from DevotionalAI', canvas.width / 2, canvas.height - 65);

    return new Promise<Blob | null>((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
  };

  const shareHero = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      const blob = await createVerseCardBlob();
      if (!blob) throw new Error('Card generation failed');

      const file = new File([blob], 'daily-verse.png', { type: 'image/png' });
      const shareData = {
        title: `Daily Verse - ${dailyVerse.ref}`,
        text: `${dailyVerse.verse} (${dailyVerse.ref})`,
        files: [file],
      };

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
        return;
      }

      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = 'daily-verse.png';
      anchor.click();
      URL.revokeObjectURL(downloadUrl);
    } catch {
      const fallback = `${dailyVerse.verse} (${dailyVerse.ref})`;
      await navigator.clipboard.writeText(fallback);
    }
  };

  return (
    <div className="flex min-h-screen flex-col pb-40">
      <header className="sticky top-0 z-50 border-b border-white/5 glass">
        <div className="mx-auto flex max-w-md items-center justify-between p-4">
          <div className="flex flex-col">
            <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">Shalom</p>
            <h2 className="text-xl font-bold tracking-tight text-white capitalize">Hello, {userName}</h2>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={() => navigate('/admin')} className="flex size-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20">
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
              </button>
            )}
            <button onClick={() => navigate('/settings')} className="flex size-10 items-center justify-center rounded-full border border-border-dark bg-surface-dark text-slate-400 hover:text-white">
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-8 px-4 pt-6">
        <section
          className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-[32px] pt-64 shadow-2xl transition-transform active:scale-[0.98]"
          onClick={openHero}
        >
          <img src={dailyVerse.imageUrl} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[8s] group-hover:scale-110" alt="Daily verse" />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/25 to-transparent" />

          <div className="absolute left-6 right-6 top-6 z-20 flex items-center justify-between">
            <div className="rounded-full border border-white/20 bg-black/20 px-4 py-2 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white">Daily Verse</p>
            </div>
            <button
              onClick={shareHero}
              className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white hover:bg-black/30"
            >
              <span className="material-symbols-outlined text-lg">share</span>
            </button>
          </div>

          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-2xl italic leading-snug text-white">"{dailyVerse.verse}"</p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">{dailyVerse.ref}</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Spiritual Feed</h3>
            <button onClick={() => navigate('/discover')} className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/20">
              Explore All
            </button>
          </div>

          {feedItems.map((item) => (
            <article
              key={item.id}
              onClick={() => navigate(`/feed/${item.id}`)}
              className="group flex cursor-pointer gap-4 rounded-[24px] border border-white/10 bg-surface-dark/60 p-4 shadow-xl transition-all hover:border-white/20 active:scale-[0.98]"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10">
                <img src={item.imageUrl} className="h-full w-full object-cover opacity-75 transition-opacity group-hover:opacity-100" alt={item.title} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-primary">{kindLabelMap[item.kind]}</p>
                <h4 className="truncate text-base font-bold text-white">{item.title}</h4>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{item.subtitle}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <span>{item.scripture}</span>
                  {item.duration && <span>• {item.duration}</span>}
                </div>
              </div>
              <span className="material-symbols-outlined self-start text-slate-600">chevron_right</span>
            </article>
          ))}

          {feedItems.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-surface-dark/40 p-8 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">No feed content yet</p>
              <p className="mt-3 text-xs text-slate-400">Ask admin to publish from Command Center to populate Home feed.</p>
            </div>
          )}
        </section>

        <section className="space-y-4 pb-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Featured Series</h3>
            <button
              onClick={() => navigate('/featured-series')}
              className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary"
            >
              Open
            </button>
          </div>
          <button
            onClick={() => navigate(heroSeries ? `/featured-series/${heroSeries.id}` : '/featured-series')}
            className="relative block w-full overflow-hidden rounded-[28px] border border-white/10 text-left shadow-2xl"
          >
            <img
              src={heroSeries?.coverImageUrl || '/media/faith-2.svg'}
              className="h-56 w-full object-cover"
              alt="Featured series"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/30" />
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{heroSeries?.title || 'Featured Series'}</p>
                <p className="mt-2 text-xl font-bold text-white">{heroSeries?.description || 'Admin-published series will appear here.'}</p>
              </div>
            </div>
          </button>
        </section>
      </main>
    </div>
  );
};

export default HomeScreen;
