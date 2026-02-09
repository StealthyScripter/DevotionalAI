
import { GeneratedContent, CalendarEntry, PipelineItem, User } from './types';

const SAVED_KEY = 'devotional_ai_saved';
const CALENDAR_KEY = 'devotional_ai_calendar';
const PIPELINE_KEY = 'devotional_ai_pipeline';
const BLACKLIST_KEY = 'devotional_ai_blacklist';
const USERS_KEY = 'devotional_auth_users';

export const storageService = {
  // Saved Devotionals
  saveDevotional: (content: GeneratedContent) => {
    const saved = storageService.getSavedDevotionals();
    const updated = [content, ...saved.filter(s => s.title !== content.title)];
    localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  },
  getSavedDevotionals: (): GeneratedContent[] => {
    const data = localStorage.getItem(SAVED_KEY);
    return data ? JSON.parse(data) : [];
  },
  isSaved: (content: GeneratedContent): boolean => {
    return storageService.getSavedDevotionals().some(s => s.title === content.title);
  },

  // Calendar
  getCalendar: (): CalendarEntry[] => {
    const data = localStorage.getItem(CALENDAR_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveCalendarEntry: (entry: CalendarEntry) => {
    const calendar = storageService.getCalendar();
    localStorage.setItem(CALENDAR_KEY, JSON.stringify([...calendar, entry]));
  },
  deleteCalendarEntry: (id: string) => {
    const calendar = storageService.getCalendar();
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(calendar.filter(e => e.id !== id)));
  },

  // Pipeline
  getPipeline: (): PipelineItem[] => {
    const data = localStorage.getItem(PIPELINE_KEY);
    return data ? JSON.parse(data) : [];
  },
  savePipelineItem: (item: PipelineItem) => {
    const pipeline = storageService.getPipeline();
    localStorage.setItem(PIPELINE_KEY, JSON.stringify([...pipeline, item]));
  },
  updatePipelineItem: (item: PipelineItem) => {
    const pipeline = storageService.getPipeline();
    const updated = pipeline.map(p => p.id === item.id ? item : p);
    localStorage.setItem(PIPELINE_KEY, JSON.stringify(updated));
  },
  deletePipelineItem: (id: string) => {
    const pipeline = storageService.getPipeline();
    localStorage.setItem(PIPELINE_KEY, JSON.stringify(pipeline.filter(p => p.id !== id)));
  },

  // Blacklist
  getBlacklist: (): string[] => {
    const data = localStorage.getItem(BLACKLIST_KEY);
    return data ? JSON.parse(data) : [];
  },
  addToBlacklist: (email: string) => {
    const blacklist = storageService.getBlacklist();
    if (!blacklist.includes(email.toLowerCase())) {
      const updated = [...blacklist, email.toLowerCase()];
      localStorage.setItem(BLACKLIST_KEY, JSON.stringify(updated));
      // Wipe user if exists
      const usersData = localStorage.getItem(USERS_KEY);
      if (usersData) {
        const users: User[] = JSON.parse(usersData);
        const filtered = users.filter(u => u.email.toLowerCase() !== email.toLowerCase());
        localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
      }
    }
  },
  removeFromBlacklist: (email: string) => {
    const blacklist = storageService.getBlacklist();
    const updated = blacklist.filter(e => e !== email.toLowerCase());
    localStorage.setItem(BLACKLIST_KEY, JSON.stringify(updated));
  },

  // Database Access
  getRawData: () => {
    const keys = [USERS_KEY, SAVED_KEY, CALENDAR_KEY, PIPELINE_KEY, BLACKLIST_KEY];
    return keys.map(key => ({
      key,
      value: localStorage.getItem(key) || '[]'
    }));
  },
  updateRawData: (key: string, value: string) => {
    try {
      JSON.parse(value); // Validate JSON
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }
};
