import { Format, GeneratedContent, PublishedContent } from '../types';
import { storageService } from '../storageService';

export type FeedKind = 'video' | 'image' | 'verse' | 'sms' | 'short-sermon' | 'long-sermon';

export interface DailyVerse {
  verse: string;
  ref: string;
  imageUrl: string;
}

export interface SpiritualFeedItem {
  id: string;
  kind: FeedKind;
  title: string;
  subtitle: string;
  imageUrl: string;
  videoUrl?: string;
  duration?: string;
  scripture: string;
  format: Format;
  content: GeneratedContent;
}

export interface FeaturedSeries {
  id: string;
  title: string;
  host: string;
  cadence: string;
  description: string;
  coverImageUrl: string;
  tags: string[];
  episodes: Array<{
    id: string;
    title: string;
    duration: string;
    scripture: string;
    summary: string;
    imageUrl: string;
    content: string;
  }>;
}

const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1200&auto=format&fit=crop';

const DAILY_VERSE_FALLBACK: DailyVerse = {
  verse: 'New content will appear here after admin publishes from Command Center.',
  ref: 'Awaiting Publication',
  imageUrl: DEFAULT_HERO_IMAGE,
};

const safePublished = (): PublishedContent[] => {
  const items = storageService.getPublishedContent();
  return items.sort((a, b) => b.publishedAt - a.publishedAt);
};

const inferKind = (item: PublishedContent): FeedKind => {
  if (item.videoUrl || item.format === Format.VideoScript) return 'video';
  if (item.imageUrl || item.format === Format.ImagePrompt) return 'image';
  if (item.format === Format.SMS) return 'sms';
  if (item.format === Format.SermonLong || item.devotionalMessage.length > 420) return 'long-sermon';
  if (item.format === Format.SermonMini || item.format === Format.SermonNotes) return 'short-sermon';
  return 'verse';
};

const estimateReadDuration = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min read`;
};

const toFeedItem = (item: PublishedContent): SpiritualFeedItem => {
  const kind = inferKind(item);
  const fallbackFormatByKind: Record<FeedKind, Format> = {
    video: Format.VideoScript,
    image: Format.ImagePrompt,
    verse: Format.SocialPost,
    sms: Format.SMS,
    'short-sermon': Format.SermonMini,
    'long-sermon': Format.SermonLong,
  };

  return {
    id: item.id,
    kind,
    title: item.title,
    subtitle: item.practicalApplication || item.callToAction || item.devotionalMessage.slice(0, 120),
    imageUrl: item.imageUrl || DEFAULT_HERO_IMAGE,
    videoUrl: item.videoUrl,
    duration: kind === 'video' ? 'Video' : kind.includes('sermon') ? estimateReadDuration(item.devotionalMessage) : undefined,
    scripture: item.bibleVerse,
    format: item.format || fallbackFormatByKind[kind],
    content: {
      title: item.title,
      bibleVerse: item.bibleVerse,
      devotionalMessage: item.devotionalMessage,
      practicalApplication: item.practicalApplication,
      callToAction: item.callToAction,
      hashtags: item.hashtags,
      imageUrl: item.imageUrl,
      videoUrl: item.videoUrl,
      format: item.format,
    },
  };
};

export const getDailyVerse = (date: Date = new Date()): DailyVerse => {
  const visualPublished = safePublished().filter((item) => item.imageUrl);
  if (visualPublished.length === 0) return DAILY_VERSE_FALLBACK;

  const dayStamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const index = Math.abs(Math.floor(dayStamp / 86400000)) % visualPublished.length;
  const selected = visualPublished[index];

  return {
    verse: selected.devotionalMessage,
    ref: selected.bibleVerse,
    imageUrl: selected.imageUrl || DEFAULT_HERO_IMAGE,
  };
};

export const getSpiritualFeed = (): SpiritualFeedItem[] => {
  const published = safePublished();
  return published.map(toFeedItem);
};

export const getSpiritualFeedItem = (id?: string): SpiritualFeedItem | undefined => {
  if (!id) return undefined;
  return getSpiritualFeed().find((item) => item.id === id);
};

const getFallbackSeriesImage = (published: PublishedContent[]) => {
  const firstVisual = published.find((item) => item.imageUrl)?.imageUrl;
  return firstVisual || DEFAULT_HERO_IMAGE;
};

const toEpisode = (item: PublishedContent, fallbackImage: string) => ({
  id: item.id,
  title: item.title,
  duration: item.videoUrl ? 'Video' : estimateReadDuration(item.devotionalMessage),
  scripture: item.bibleVerse,
  summary: item.practicalApplication || item.callToAction || item.devotionalMessage.slice(0, 100),
  imageUrl: item.imageUrl || fallbackImage,
  content: item.devotionalMessage,
});

export const getFeaturedSeries = (): FeaturedSeries[] => {
  const published = safePublished();
  if (published.length === 0) return [];

  const fallbackImage = getFallbackSeriesImage(published);
  const visuals = published.filter((item) => item.imageUrl || item.videoUrl).slice(0, 6);
  const sermons = published.filter((item) => {
    const kind = inferKind(item);
    return kind === 'short-sermon' || kind === 'long-sermon';
  }).slice(0, 6);
  const shortText = published.filter((item) => {
    const kind = inferKind(item);
    return kind === 'verse' || kind === 'sms';
  }).slice(0, 6);

  const series: FeaturedSeries[] = [
    {
      id: 'series-visual-encounters',
      title: 'Visual Encounters',
      host: 'DevotionalAI Studio',
      cadence: 'Updated from Admin Publish Queue',
      description: 'Image and video devotionals released from the command center.',
      coverImageUrl: visuals[0]?.imageUrl || fallbackImage,
      tags: ['Visual', 'Media', 'Worship'],
      episodes: visuals.map((item) => toEpisode(item, fallbackImage)),
    },
    {
      id: 'series-sermon-vault',
      title: 'Sermon Vault',
      host: 'DevotionalAI Studio',
      cadence: 'Updated from Admin Publish Queue',
      description: 'Short and long sermons curated from admin-generated releases.',
      coverImageUrl: sermons[0]?.imageUrl || fallbackImage,
      tags: ['Teaching', 'Sermons', 'Scripture'],
      episodes: sermons.map((item) => toEpisode(item, fallbackImage)),
    },
    {
      id: 'series-word-reflections',
      title: 'Word Reflections',
      host: 'DevotionalAI Studio',
      cadence: 'Updated from Admin Publish Queue',
      description: 'Text reflections, verses, and short encouragements.',
      coverImageUrl: shortText[0]?.imageUrl || fallbackImage,
      tags: ['Reflection', 'Daily Word', 'Encouragement'],
      episodes: shortText.map((item) => toEpisode(item, fallbackImage)),
    },
  ];

  return series.filter((item) => item.episodes.length > 0);
};

export const getFeaturedSeriesById = (id?: string): FeaturedSeries | undefined => {
  if (!id) return undefined;
  return getFeaturedSeries().find((series) => series.id === id);
};

export const getFeaturedSeriesEpisode = (seriesId?: string, episodeId?: string) => {
  const series = getFeaturedSeriesById(seriesId);
  if (!series || !episodeId) return undefined;
  return series.episodes.find((episode) => episode.id === episodeId);
};
