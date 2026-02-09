
import React, { useState, useMemo } from 'react';
import { GeneratedContent, Theme, Format } from '../types';

enum ContentType {
  ShortMessage = 'Short Message',
  MiniSermon = 'Mini-Sermon',
  FullSermon = 'Full Sermon',
  Image = 'Spiritual Image',
  Video = 'Video Reflection'
}

interface FeedItem {
  id: string;
  type: ContentType;
  format: Format;
  title: string;
  author: string;
  preview: string;
  imageUrl: string;
  likes: string;
  timestamp: string;
  tags: string[];
  theme: Theme;
  fullContent?: GeneratedContent;
}

const MOCK_FEED: FeedItem[] = [
  {
    id: '1',
    type: ContentType.FullSermon,
    format: Format.SermonNotes,
    title: 'Finding Strength in Peace',
    author: 'Pastor John Marks',
    preview: 'A reflection on maintaining peace in your heart regardless of external circumstances.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop',
    likes: '1.2k',
    timestamp: '2h ago',
    theme: Theme.Hope,
    tags: ['Hope', 'Peace'],
    fullContent: {
      title: 'Finding Strength in Peace',
      bibleVerse: 'John 14:27',
      devotionalMessage: "Peace I leave with you; my peace I give to you. Not as the world gives do I give to you. Let not your hearts be troubled, neither let them be afraid.",
      practicalApplication: "Sit in silence for 5 minutes today.",
      callToAction: "Choose peace over worry.",
      format: Format.SermonNotes
    }
  },
  {
    id: '2',
    type: ContentType.ShortMessage,
    format: Format.SMS,
    title: 'The Love of the Father',
    author: 'Sarah Mitchell',
    preview: 'Exploring the reckless love of God for his children.',
    imageUrl: 'https://images.unsplash.com/photo-1518111267439-094776100c5c?q=80&w=400&auto=format&fit=crop',
    likes: '940',
    timestamp: '5h ago',
    theme: Theme.Love,
    tags: ['Grace', 'Love'],
    fullContent: {
      title: 'The Father\'s Open Arms',
      bibleVerse: 'Luke 15:20',
      devotionalMessage: "God doesn't wait for you to be perfect to love you.",
      practicalApplication: "Extend grace to someone today.",
      callToAction: "Receive the Father's love.",
      format: Format.SMS
    }
  },
  {
    id: '3',
    type: ContentType.MiniSermon,
    format: Format.SermonNotes,
    title: 'Healing Through Grace',
    author: 'Pastor David King',
    preview: 'How the grace of God works to heal the brokenhearted.',
    imageUrl: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=400&auto=format&fit=crop',
    likes: '850',
    timestamp: '1d ago',
    theme: Theme.Healing,
    tags: ['Healing', 'Grace'],
    fullContent: {
      title: 'Healed by Grace',
      bibleVerse: 'Isaiah 53:5',
      devotionalMessage: "By his wounds we are healed. This isn't just physical, but deep spiritual restoration.",
      practicalApplication: "Forgive someone you have a grudge against.",
      callToAction: "Rest in His healing presence.",
      format: Format.SermonNotes
    }
  },
  {
    id: '4',
    type: ContentType.ShortMessage,
    format: Format.SMS,
    title: 'The Parable of the Prodigal',
    author: 'Pastor Michael',
    preview: 'A timeless story of redemption and a father\'s love.',
    imageUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=400&auto=format&fit=crop',
    likes: '2.1k',
    timestamp: '3h ago',
    theme: Theme.BibleStories,
    tags: ['Parable', 'Redemption'],
    fullContent: {
      title: 'The Journey Home',
      bibleVerse: 'Luke 15:11-32',
      devotionalMessage: "The father saw him while he was still a long way off. This is how God waits for us.",
      practicalApplication: "Turn back to God in any area you've wandered.",
      callToAction: "Accept the welcome home.",
      format: Format.SMS
    }
  },
  {
    id: '5',
    type: ContentType.MiniSermon,
    format: Format.SermonNotes,
    title: 'Foundation for Families',
    author: 'Sister Ruth',
    preview: 'Building your household on the rock of Christ.',
    imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=400&auto=format&fit=crop',
    likes: '1.5k',
    timestamp: '6h ago',
    theme: Theme.Family,
    tags: ['Family', 'Legacy'],
    fullContent: {
      title: 'The Divine Blueprint for Family',
      bibleVerse: 'Joshua 24:15',
      devotionalMessage: "As for me and my house, we will serve the Lord.",
      practicalApplication: "Lead your family in a short prayer tonight.",
      callToAction: "Commit your household to Christ.",
      format: Format.SermonNotes
    }
  },
  {
    id: '6',
    type: ContentType.FullSermon,
    format: Format.SermonNotes,
    title: 'Walking Through the Fire',
    author: 'Pastor Elias',
    preview: 'How to maintain faith when you are in the midst of tribulation.',
    imageUrl: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=400&auto=format&fit=crop',
    likes: '3k',
    timestamp: '12h ago',
    theme: Theme.Tribulation,
    tags: ['Trials', 'Faith'],
    fullContent: {
      title: 'Unshakable in the Storm',
      bibleVerse: 'James 1:2-4',
      devotionalMessage: "Count it all joy when you meet trials of various kinds. Tribulation produces endurance.",
      practicalApplication: "List three things you are thankful for despite your current trial.",
      callToAction: "Hold fast to the anchor of Hope.",
      format: Format.SermonNotes
    }
  }
];

interface Props {
  onSelectItem: (content: GeneratedContent) => void;
}

const DiscoverScreen: React.FC<Props> = ({ onSelectItem }) => {
  const [activeTheme, setActiveTheme] = useState<Theme | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const themes = ['All', ...Object.values(Theme)];

  const filteredFeed = useMemo(() => {
    return MOCK_FEED.filter(item => {
      const matchesTheme = activeTheme === 'All' || item.theme === activeTheme;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTheme && matchesSearch;
    });
  }, [activeTheme, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-background-dark pb-40">
      <header className="sticky top-0 z-50 glass px-4 py-4 border-b border-white/5">
        <h2 className="text-xl font-bold font-jakarta mb-4">Discover</h2>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-surface-dark border border-white/5 rounded-2xl text-sm text-white focus:ring-1 focus:ring-primary outline-none" 
            placeholder="Stories, topics, or verses..." 
          />
        </div>
      </header>

      <main className="space-y-8 pt-6">
        <section className="space-y-4">
          <div className="px-4 flex items-center justify-between">
            <h3 className="text-lg font-bold font-jakarta">Featured Series</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4">
            {MOCK_FEED.map((item) => (
              <div 
                key={item.id} 
                onClick={() => item.fullContent && onSelectItem(item.fullContent)}
                className="shrink-0 w-72 rounded-2xl bg-surface-dark border border-white/5 overflow-hidden active:scale-95 transition-transform group"
              >
                <div className="aspect-[16/10] relative">
                  <img src={item.imageUrl} className="w-full h-full object-cover opacity-80" alt={item.title} />
                  <button className="absolute top-4 right-4 z-20 size-8 rounded-full glass border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
                    <span className="material-symbols-outlined text-lg">more_vert</span>
                  </button>
                </div>
                <div className="p-6">
                  <h4 className="text-white font-bold text-base mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-slate-500 text-xs line-clamp-2">{item.preview}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3 px-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Topical Explorer</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {themes.map((t) => (
              <button 
                key={t} 
                onClick={() => setActiveTheme(t as Theme | 'All')}
                className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeTheme === t ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface-dark text-slate-500 border-white/5 hover:border-white/10'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4 px-4 pb-12">
          {filteredFeed.map((item) => (
            <div 
              key={item.id} 
              onClick={() => item.fullContent && onSelectItem(item.fullContent)}
              className="bg-surface-dark border border-white/5 rounded-2xl p-4 active:scale-98 transition-transform group flex gap-4 items-center"
            >
              <div className="size-20 rounded-xl overflow-hidden shrink-0 border border-white/5">
                <img src={item.imageUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt={item.title} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{item.type}</p>
                <h4 className="text-white font-bold text-sm truncate group-hover:text-primary transition-colors">{item.title}</h4>
                <p className="text-slate-500 text-xs mt-1">by {item.author}</p>
              </div>
              <button className="text-slate-600 hover:text-white transition-colors">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          ))}
          {filteredFeed.length === 0 && (
            <div className="py-20 text-center space-y-4 opacity-30">
              <span className="material-symbols-outlined text-6xl">search_off</span>
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">No matches found</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DiscoverScreen;
