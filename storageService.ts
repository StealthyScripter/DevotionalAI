import { GeneratedContent, CalendarEntry, PipelineItem, PublishedContent, AuditLogEntry } from './types';
import { authService } from './authService';

const SAVED_KEY = 'devotional_ai_saved';
const CALENDAR_KEY = 'devotional_ai_calendar';
const PIPELINE_KEY = 'devotional_ai_pipeline';
const PUBLISHED_KEY = 'devotional_ai_published';
const RAW_KEY = 'devotional_ai_raw';
const AUDIT_KEY = 'devotional_ai_audit';
const MIGRATION_PREFIX = 'devotional_api_migrated_';

const contentSignature = (content: GeneratedContent) =>
  `${content.title}::${content.bibleVerse}::${content.devotionalMessage}`.toLowerCase();

const readJson = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return fallback;
  try {
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const authHeaders = () => {
  const session = authService.getSession();
  if (!session?.token) throw new Error('Missing auth session.');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.token}`,
  };
};

const request = async <T>(path: string, init: RequestInit): Promise<T> => {
  const res = await fetch(path, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data as T;
};

const emitDataSync = () => {
  window.dispatchEvent(new CustomEvent('devotional:data-sync'));
};

export const storageService = {
  clearLocalCaches: () => {
    localStorage.removeItem(SAVED_KEY);
    localStorage.removeItem(CALENDAR_KEY);
    localStorage.removeItem(PIPELINE_KEY);
    localStorage.removeItem(PUBLISHED_KEY);
    localStorage.removeItem(RAW_KEY);
    localStorage.removeItem(AUDIT_KEY);
  },

  initializeSessionData: async () => {
    await storageService.migrateLegacyLocalDataIfNeeded();
    await storageService.syncData();
  },

  ensureSeedData: async () => {
    await storageService.initializeSessionData();
  },

  migrateLegacyLocalDataIfNeeded: async () => {
    const session = authService.getSession();
    if (!session) return;

    const markerKey = `${MIGRATION_PREFIX}${session.user.id}`;
    if (localStorage.getItem(markerKey) === 'true') return;

    const localSaved = readJson<GeneratedContent[]>(SAVED_KEY, []);
    const localCalendar = readJson<CalendarEntry[]>(CALENDAR_KEY, []);
    const localPipeline = readJson<PipelineItem[]>(PIPELINE_KEY, []);
    const localPublished = readJson<PublishedContent[]>(PUBLISHED_KEY, []);

    if (localSaved.length === 0 && localCalendar.length === 0 && localPipeline.length === 0 && localPublished.length === 0) {
      localStorage.setItem(markerKey, 'true');
      return;
    }

    const scope = session.user.role === 'admin' ? 'all' : 'mine';
    const remote = await request<{ success: boolean; saved: GeneratedContent[]; calendar: CalendarEntry[]; pipeline: PipelineItem[]; published: PublishedContent[] }>(
      `/api/data/snapshot?scope=${scope}`,
      { method: 'GET', headers: authHeaders() }
    );

    const remoteSavedSignatures = new Set((remote.saved || []).map(contentSignature));
    for (const content of localSaved) {
      if (!remoteSavedSignatures.has(contentSignature(content))) {
        await request('/api/data/saved', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ content }),
        });
      }
    }

    const remoteCalendarIds = new Set((remote.calendar || []).map((entry) => entry.id));
    for (const entry of localCalendar) {
      if (!remoteCalendarIds.has(entry.id)) {
        await request('/api/data/calendar', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ entry }),
        });
      }
    }

    const remotePipelineIds = new Set((remote.pipeline || []).map((item) => item.id));
    for (const item of localPipeline) {
      if (!remotePipelineIds.has(item.id)) {
        await request('/api/data/pipeline', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ item }),
        });
      }
    }

    if (session.user.role === 'admin' && localPublished.length > 0) {
      const remotePublishedSignatures = new Set((remote.published || []).map(contentSignature));
      for (const item of localPublished) {
        if (!remotePublishedSignatures.has(contentSignature(item))) {
          const { id, publishedAt, ...content } = item;
          void id;
          void publishedAt;
          await request('/api/data/published', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ content }),
          });
        }
      }
    }

    localStorage.setItem(markerKey, 'true');
  },

  syncData: async () => {
    const session = authService.getSession();
    if (!session) return;

    const scope = session.user.role === 'admin' ? 'all' : 'mine';
    const data = await request<{ success: boolean; saved: GeneratedContent[]; calendar: CalendarEntry[]; pipeline: PipelineItem[]; published: PublishedContent[] }>(
      `/api/data/snapshot?scope=${scope}`,
      {
        method: 'GET',
        headers: authHeaders(),
      }
    );

    writeJson(SAVED_KEY, data.saved || []);
    writeJson(CALENDAR_KEY, data.calendar || []);
    writeJson(PIPELINE_KEY, data.pipeline || []);
    writeJson(PUBLISHED_KEY, data.published || []);

    if (session.user.role === 'admin') {
      await storageService.refreshRawData().catch(() => undefined);
    }

    emitDataSync();
  },

  // Saved Devotionals
  saveDevotional: async (content: GeneratedContent) => {
    const data = await request<{ success: boolean; saved: GeneratedContent[] }>('/api/data/saved', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ content }),
    });
    writeJson(SAVED_KEY, data.saved || []);
    emitDataSync();
  },
  getSavedDevotionals: (): GeneratedContent[] => readJson<GeneratedContent[]>(SAVED_KEY, []),
  isSaved: (content: GeneratedContent): boolean => storageService.getSavedDevotionals().some((s) => s.title === content.title),

  // Calendar
  getCalendar: (): CalendarEntry[] => readJson<CalendarEntry[]>(CALENDAR_KEY, []),
  saveCalendarEntry: async (entry: CalendarEntry) => {
    const data = await request<{ success: boolean; calendar: CalendarEntry[] }>('/api/data/calendar', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ entry }),
    });
    writeJson(CALENDAR_KEY, data.calendar || []);
    emitDataSync();
  },
  deleteCalendarEntry: async (id: string) => {
    const data = await request<{ success: boolean; calendar: CalendarEntry[] }>(`/api/data/calendar/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    writeJson(CALENDAR_KEY, data.calendar || []);
    emitDataSync();
  },

  // Pipeline
  getPipeline: (): PipelineItem[] => readJson<PipelineItem[]>(PIPELINE_KEY, []),
  savePipelineItem: async (item: PipelineItem) => {
    const data = await request<{ success: boolean; pipeline: PipelineItem[] }>('/api/data/pipeline', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ item }),
    });
    writeJson(PIPELINE_KEY, data.pipeline || []);
    emitDataSync();
  },
  updatePipelineItem: async (item: PipelineItem) => {
    const data = await request<{ success: boolean; pipeline: PipelineItem[] }>(`/api/data/pipeline/${item.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ item }),
    });
    writeJson(PIPELINE_KEY, data.pipeline || []);
    emitDataSync();
  },
  deletePipelineItem: async (id: string) => {
    const data = await request<{ success: boolean; pipeline: PipelineItem[] }>(`/api/data/pipeline/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    writeJson(PIPELINE_KEY, data.pipeline || []);
    emitDataSync();
  },

  // Published Content (Admin -> User feed source of truth)
  getPublishedContent: (): PublishedContent[] => readJson<PublishedContent[]>(PUBLISHED_KEY, []),
  savePublishedContent: async (content: GeneratedContent, source: PublishedContent['source'] = 'manual') => {
    const data = await request<{ success: boolean; published: PublishedContent[] }>('/api/data/published', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ content: { ...content, source } }),
    });
    writeJson(PUBLISHED_KEY, data.published || []);
    emitDataSync();
  },
  deletePublishedContent: async (id: string) => {
    const data = await request<{ success: boolean; published: PublishedContent[] }>(`/api/data/published/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    writeJson(PUBLISHED_KEY, data.published || []);
    emitDataSync();
  },

  // Admin raw data access
  getRawData: () => readJson<{ key: string; value: string }[]>(RAW_KEY, []),
  refreshRawData: async () => {
    const data = await request<{ success: boolean; raw: { key: string; value: string }[] }>('/api/admin/data/raw', {
      method: 'GET',
      headers: authHeaders(),
    });
    writeJson(RAW_KEY, data.raw || []);
    return data.raw || [];
  },
  updateRawData: async (key: string, value: string) => {
    try {
      JSON.parse(value);
      await request('/api/admin/data/raw', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ key, value }),
      });
      await storageService.refreshRawData();
      emitDataSync();
      return true;
    } catch {
      return false;
    }
  },

  // Admin audit logs
  getAuditLogs: () => readJson<AuditLogEntry[]>(AUDIT_KEY, []),
  refreshAuditLogs: async (limit = 200) => {
    const data = await request<{ success: boolean; logs: AuditLogEntry[] }>(`/api/admin/audit?limit=${limit}`, {
      method: 'GET',
      headers: authHeaders(),
    });
    writeJson(AUDIT_KEY, data.logs || []);
    return data.logs || [];
  },
};
