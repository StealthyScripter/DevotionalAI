import { User, AuthSession, Role } from './types';

const SESSION_KEY = 'devotional_auth_session';
const USERS_CACHE_KEY = 'devotional_auth_users_cache';
const BLACKLIST_CACHE_KEY = 'devotional_auth_blacklist_cache';
const CHALLENGE_KEY = 'temp_2fa_challenge_id';
const SAVED_KEY = 'devotional_ai_saved';
const CALENDAR_KEY = 'devotional_ai_calendar';
const PIPELINE_KEY = 'devotional_ai_pipeline';
const PUBLISHED_KEY = 'devotional_ai_published';
const RAW_KEY = 'devotional_ai_raw';
const AUDIT_KEY = 'devotional_ai_audit';

export const MASTER_ADMIN_EMAIL = 'admin@devotional.ai';

interface ApiResult {
  success: boolean;
  message?: string;
}

const normalizeSession = (session: any): AuthSession | null => {
  if (!session || !session.user || !session.token || !session.expiresAt) return null;
  return session as AuthSession;
};

const getToken = () => {
  const session = authService.getSession();
  return session?.token || '';
};

const clearDataCaches = () => {
  localStorage.removeItem(SAVED_KEY);
  localStorage.removeItem(CALENDAR_KEY);
  localStorage.removeItem(PIPELINE_KEY);
  localStorage.removeItem(PUBLISHED_KEY);
  localStorage.removeItem(RAW_KEY);
  localStorage.removeItem(AUDIT_KEY);
};

const apiRequest = async <T = any>(path: string, init: RequestInit = {}): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers || {}),
  };

  const res = await fetch(path, {
    ...init,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data as T;
};

export const authService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_CACHE_KEY);
    return data ? JSON.parse(data) : [];
  },

  refreshUsers: async (): Promise<User[]> => {
    const token = getToken();
    if (!token) return authService.getUsers();

    const data = await apiRequest<{ success: boolean; users: User[] }>('/api/admin/users', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(data.users || []));
    return data.users || [];
  },

  getBlacklist: (): string[] => {
    const data = localStorage.getItem(BLACKLIST_CACHE_KEY);
    return data ? JSON.parse(data) : [];
  },

  refreshBlacklist: async (): Promise<string[]> => {
    const token = getToken();
    if (!token) return authService.getBlacklist();

    const data = await apiRequest<{ success: boolean; blacklist: string[] }>('/api/admin/blacklist', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    localStorage.setItem(BLACKLIST_CACHE_KEY, JSON.stringify(data.blacklist || []));
    return data.blacklist || [];
  },

  addToBlacklist: async (email: string): Promise<string[]> => {
    const token = getToken();
    if (!token) throw new Error('Missing auth session.');

    const data = await apiRequest<{ success: boolean; blacklist: string[] }>('/api/admin/blacklist/add', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email }),
    });

    localStorage.setItem(BLACKLIST_CACHE_KEY, JSON.stringify(data.blacklist || []));
    return data.blacklist || [];
  },

  removeFromBlacklist: async (email: string): Promise<string[]> => {
    const token = getToken();
    if (!token) throw new Error('Missing auth session.');

    const data = await apiRequest<{ success: boolean; blacklist: string[] }>('/api/admin/blacklist/remove', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email }),
    });

    localStorage.setItem(BLACKLIST_CACHE_KEY, JSON.stringify(data.blacklist || []));
    return data.blacklist || [];
  },

  signUp: async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const data = await apiRequest<{ success: boolean; message: string }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return { success: data.success, message: data.message || 'Account created.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Registration failed.' };
    }
  },

  signIn: async (email: string, password: string): Promise<{ success: boolean; user?: User; message?: string; requires2FA?: boolean }> => {
    try {
      const data = await apiRequest<any>('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.requires2FA && data.challengeId) {
        sessionStorage.setItem(CHALLENGE_KEY, data.challengeId);
        return { success: true, requires2FA: true };
      }

      const session = normalizeSession(data.session);
      if (session) {
        authService.createSession(session.user, session.token, session.expiresAt);
        return { success: true, user: session.user };
      }

      return { success: false, message: 'Invalid sign-in response.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed.' };
    }
  },

  verifyEmail: async (email: string) => {
    await apiRequest('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return true;
  },

  verify2FA: async (code: string): Promise<{ success: boolean; message?: string }> => {
    const challengeId = sessionStorage.getItem(CHALLENGE_KEY);
    if (!challengeId) return { success: false, message: 'Session expired.' };

    try {
      const data = await apiRequest<any>('/api/auth/verify-2fa', {
        method: 'POST',
        body: JSON.stringify({ challengeId, code }),
      });

      const session = normalizeSession(data.session);
      if (!session) return { success: false, message: 'Invalid session response.' };

      authService.createSession(session.user, session.token, session.expiresAt);
      sessionStorage.removeItem(CHALLENGE_KEY);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || 'Invalid code.' };
    }
  },

  updateUserRole: async (userId: string, newRole: Role) => {
    const token = getToken();
    if (!token) throw new Error('Missing auth session.');

    const data = await apiRequest<{ success: boolean; users: User[] }>(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role: newRole }),
    });

    localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(data.users || []));
  },

  createSession: (user: User, token: string, expiresAt: number) => {
    const previous = authService.getSession();
    if (previous && previous.user.id !== user.id) {
      clearDataCaches();
    }
    const session: AuthSession = { user, token, expiresAt };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  getSession: (): AuthSession | null => {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;

    const session = normalizeSession(JSON.parse(data));
    if (!session) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    if (Date.now() > session.expiresAt) {
      authService.logout();
      return null;
    }

    return session;
  },

  refreshSession: async (): Promise<AuthSession | null> => {
    const session = authService.getSession();
    if (!session) return null;

    try {
      const data = await apiRequest<any>('/api/auth/session', {
        method: 'GET',
        headers: { Authorization: `Bearer ${session.token}` },
      });

      const nextSession = normalizeSession(data.session);
      if (!nextSession) throw new Error('Invalid session payload.');

      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      return nextSession;
    } catch {
      authService.logout();
      return null;
    }
  },

  logout: () => {
    const session = authService.getSession();
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(CHALLENGE_KEY);
    clearDataCaches();

    if (session?.token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
      }).catch(() => undefined);
    }
  },

  resetPasswordRequest: async (email: string): Promise<ApiResult> => {
    try {
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || 'Reset failed.' };
    }
  },
};
