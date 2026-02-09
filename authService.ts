
import { User, Role, AuthSession } from './types';
import { storageService } from './storageService';

const USERS_KEY = 'devotional_auth_users';
const SESSION_KEY = 'devotional_auth_session';

export const MASTER_ADMIN_EMAIL = 'admin@devotional.ai';
const MASTER_ADMIN_PASSWORD_PLAIN = 'Devotional@2025&Home';
const FORWARD_EMAIL = 'koringobrian@gmail.com';

const hashPassword = (password: string) => btoa(`salt_${password}_divine`);
const MASTER_ADMIN_HASH = hashPassword(MASTER_ADMIN_PASSWORD_PLAIN);

export const authService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    let users: User[] = data ? JSON.parse(data) : [];
    
    const adminIndex = users.findIndex(u => u.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase());
    
    if (adminIndex === -1) {
      const master: User = {
        id: 'master-root-001',
        email: MASTER_ADMIN_EMAIL,
        passwordHash: MASTER_ADMIN_HASH,
        role: Role.Admin,
        isVerified: true,
        is2FAEnabled: true,
        acceptedTermsAt: Date.now(),
        createdAt: Date.now()
      };
      users.push(master);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } else {
      if (users[adminIndex].passwordHash !== MASTER_ADMIN_HASH) {
        users[adminIndex].passwordHash = MASTER_ADMIN_HASH;
        users[adminIndex].role = Role.Admin;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    }
    return users;
  },

  signUp: async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const blacklist = storageService.getBlacklist();
    if (blacklist.includes(email.toLowerCase())) {
      return { success: false, message: 'This identity has been cast out from the tabernacle.' };
    }

    const users = authService.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      passwordHash: hashPassword(password),
      role: Role.User,
      isVerified: false,
      is2FAEnabled: true,
      acceptedTermsAt: Date.now(),
      createdAt: Date.now()
    };

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    console.log(`[SYSTEM] Account Verification: Code VERIFY-777 sent to ${email} (Forwarded to: ${FORWARD_EMAIL})`);
    return { success: true, message: 'Account created. Please verify your email.' };
  },

  signIn: async (email: string, password: string): Promise<{ success: boolean; user?: User; message?: string; requires2FA?: boolean }> => {
    const blacklist = storageService.getBlacklist();
    if (blacklist.includes(email.toLowerCase())) {
      return { success: false, message: 'This identity is blacklisted.' };
    }

    const users = authService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === hashPassword(password));

    if (!user) return { success: false, message: 'Invalid email or password.' };
    if (!user.isVerified) return { success: false, message: 'Please verify your email address.' };

    if (user.is2FAEnabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem('temp_2fa_code', code);
      sessionStorage.setItem('temp_2fa_user', JSON.stringify(user));
      console.log(`[2FA] Login code for ${email}: ${code} (Forwarded to: ${FORWARD_EMAIL})`);
      return { success: true, requires2FA: true };
    }

    authService.createSession(user);
    return { success: true, user };
  },

  verifyEmail: async (email: string) => {
    const users = authService.getUsers();
    const updatedUsers = users.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, isVerified: true } : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    return true;
  },

  verify2FA: async (code: string): Promise<{ success: boolean; message?: string }> => {
    const storedCode = sessionStorage.getItem('temp_2fa_code');
    const storedUser = sessionStorage.getItem('temp_2fa_user');
    if (!storedCode || !storedUser) return { success: false, message: 'Session expired.' };

    if (code === storedCode) {
      authService.createSession(JSON.parse(storedUser));
      sessionStorage.removeItem('temp_2fa_code');
      sessionStorage.removeItem('temp_2fa_user');
      return { success: true };
    }
    return { success: false, message: 'Invalid code.' };
  },

  updateUserRole: (userId: string, newRole: Role) => {
    const users = authService.getUsers();
    const updatedUsers = users.map(u => (u.id === userId && u.email !== MASTER_ADMIN_EMAIL) ? { ...u, role: newRole } : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  },

  createSession: (user: User) => {
    const session: AuthSession = { user, token: `jwt_${Math.random().toString(36)}`, expiresAt: Date.now() + 86400000 };
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

  logout: () => localStorage.removeItem(SESSION_KEY),

  resetPasswordRequest: async (email: string) => {
    console.log(`[RESET] Password reset link for ${email} (Forwarded to: ${FORWARD_EMAIL})`);
    return true;
  }
};
