
import { GeneratedContent } from './types';

const SAVED_KEY = 'devotional_ai_saved';
const DRAFTS_KEY = 'devotional_ai_drafts';

export const storageService = {
  saveDevotional: (content: GeneratedContent) => {
    const saved = storageService.getSavedDevotionals();
    
    // Integrity Check: Use composite key (Title + Verse) to identify uniqueness
    const exists = saved.find(s => 
      s.title.toLowerCase().trim() === content.title.toLowerCase().trim() && 
      s.bibleVerse.toLowerCase().trim() === content.bibleVerse.toLowerCase().trim()
    );
    
    if (!exists) {
      const updated = [content, ...saved];
      localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    }
  },

  unsaveDevotional: (title: string) => {
    const saved = storageService.getSavedDevotionals();
    const updated = saved.filter(s => s.title !== title);
    localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  },

  getSavedDevotionals: (): GeneratedContent[] => {
    const data = localStorage.getItem(SAVED_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveDraft: (content: GeneratedContent) => {
    const drafts = storageService.getDrafts();
    
    // Integrity check for drafts as well
    const exists = drafts.find(s => 
      s.title.toLowerCase().trim() === content.title.toLowerCase().trim() && 
      s.bibleVerse.toLowerCase().trim() === content.bibleVerse.toLowerCase().trim()
    );
    
    if (!exists) {
      const updated = [content, ...drafts];
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
    }
  },

  getDrafts: (): GeneratedContent[] => {
    const data = localStorage.getItem(DRAFTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  isSaved: (content: GeneratedContent): boolean => {
    const saved = storageService.getSavedDevotionals();
    return saved.some(s => 
      s.title.toLowerCase().trim() === content.title.toLowerCase().trim() && 
      s.bibleVerse.toLowerCase().trim() === content.bibleVerse.toLowerCase().trim()
    );
  }
};
