
import { User, Role, AuthSession } from './types';

const USERS_KEY = 'devotional_auth_users';
const SESSION_KEY = 'devotional_auth_session';
const ADMIN_WHITELIST = ['admin@devotional.ai', 'pastor@devotional.ai'];

// Mock hashing
const hashPassword = (password: string) => btoa(`salt_${password}_divine`);

export const authService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  signUp: async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const users = authService.getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      passwordHash: hashPassword(password),
      role: ADMIN_WHITELIST.includes(email.toLowerCase()) ? Role.Admin : Role.User,
      isVerified: false,
      is2FAEnabled: true,
      createdAt: Date.now()
    };

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    
    // Simulate sending verification email
    console.log(`[SIMULATED EMAIL] To: ${email} | Subject: Verify Your DevotionalAI Account | Code: VERIFY-777`);
    
    return { success: true, message: 'Account created. Please verify your email.' };
  },

  signIn: async (email: string, password: string): Promise<{ success: boolean; user?: User; message?: string; requires2FA?: boolean }> => {
    const users = authService.getUsers();
    const user = users.find(u => u.email === email && u.passwordHash === hashPassword(password));

    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    if (!user.isVerified) {
      return { success: false, message: 'Please verify your email address before logging in.' };
    }

    if (user.is2FAEnabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem('temp_2fa_code', code);
      sessionStorage.setItem('temp_2fa_user', JSON.stringify(user));
      console.log(`[SIMULATED SMS/EMAIL] To: ${email} | Your 2FA Login Code: ${code}`);
      return { success: true, requires2FA: true };
    }

    authService.createSession(user);
    return { success: true, user };
  },

  verify2FA: async (code: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    const correctCode = sessionStorage.getItem('temp_2fa_code');
    const userJson = sessionStorage.getItem('temp_2fa_user');

    if (code === correctCode && userJson) {
      const user = JSON.parse(userJson);
      authService.createSession(user);
      sessionStorage.removeItem('temp_2fa_code');
      sessionStorage.removeItem('temp_2fa_user');
      return { success: true, user };
    }

    return { success: false, message: 'Invalid or expired 2FA code.' };
  },

  verifyEmail: async (email: string): Promise<boolean> => {
    const users = authService.getUsers();
    const index = users.findIndex(u => u.email === email);
    if (index !== -1) {
      users[index].isVerified = true;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return true;
    }
    return false;
  },

  createSession: (user: User) => {
    const session: AuthSession = {
      user,
      token: `jwt_${Math.random().toString(36)}`,
      expiresAt: Date.now() + 86400000 // 24 hours
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  getSession: (): AuthSession | null => {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    const session = JSON.parse(data);
    if (Date.now() > session.expiresAt) {
      authService.logout();
      return null;
    }
    return session;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  resetPasswordRequest: async (email: string) => {
    console.log(`[SIMULATED EMAIL] To: ${email} | Subject: Password Reset Request | Link: devotional.ai/reset?token=xyz`);
    return true; // Always return true to prevent enumeration
  }
};
