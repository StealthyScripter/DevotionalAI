
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import LandingScreen from './screens/LandingScreen';
import HomeScreen from './screens/HomeScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import ProfileScreen from './screens/ProfileScreen';
import PreviewScreen from './screens/PreviewScreen';
import SettingsScreen from './screens/SettingsScreen';
import ChatScreen from './screens/ChatScreen';
import AdminPipelineScreen from './screens/AdminPipelineScreen';
import FeedDetailScreen from './screens/FeedDetailScreen';
import FeaturedSeriesScreen from './screens/FeaturedSeriesScreen';
import FeaturedSeriesDetailScreen from './screens/FeaturedSeriesDetailScreen';
import FeaturedEpisodeScreen from './screens/FeaturedEpisodeScreen';
import MeditationScreen from './screens/MeditationScreen';
import SignInScreen from './screens/auth/SignInScreen';
import SignUpScreen from './screens/auth/SignUpScreen';
import TwoFactorScreen from './screens/auth/TwoFactorScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import { GeneratedContent, AuthSession, Role } from './types';
import { authService } from './authService';
import { storageService } from './storageService';

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background-dark text-white flex items-center justify-center px-6">
          <div className="max-w-sm w-full rounded-3xl border border-white/10 bg-surface-dark/70 p-8 text-center space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Notice</p>
            <h1 className="text-2xl font-bold font-jakarta">Something went wrong</h1>
            <p className="text-sm text-slate-300">Please refresh the app and try again.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-white"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const session = authService.getSession();
  if (!session) return <Navigate to="/signin" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children?: React.ReactNode }) {
  const session = authService.getSession();
  if (!session || session.user.role !== Role.Admin) {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  const [session, setSession] = useState<AuthSession | null>(() => authService.getSession());
  const lastSessionStr = useRef(JSON.stringify(authService.getSession()));

  const syncSession = useCallback(() => {
    const current = authService.getSession();
    const currentStr = JSON.stringify(current);
    if (currentStr !== lastSessionStr.current) {
      lastSessionStr.current = currentStr;
      setSession(current);
    }
  }, []);

  useEffect(() => {
    void storageService.ensureSeedData();
    void authService.refreshSession().then(syncSession);
    window.addEventListener('storage', syncSession);
    const interval = setInterval(syncSession, 2000);
    return () => {
      window.removeEventListener('storage', syncSession);
      clearInterval(interval);
    };
  }, [syncSession]);

  useEffect(() => {
    if (!session) return;
    void storageService.initializeSessionData();
  }, [session?.user.id]);

  const viewContent = (content: GeneratedContent) => {
    setSelectedContent(content);
    navigate('/preview');
  };

  const isAuthPage = ['/', '/signin', '/signup', '/verify-2fa', '/forgot-password'].includes(location.pathname);
  const isAdmin = session?.user.role === Role.Admin;

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative bg-background-dark shadow-2xl overflow-x-hidden font-sans selection:bg-primary/30">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <Routes>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/signin" element={<SignInScreen onLoginSuccess={syncSession} />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/verify-2fa" element={<TwoFactorScreen onLoginSuccess={syncSession} />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
          <Route path="/discover" element={<ProtectedRoute><DiscoverScreen onSelectItem={viewContent} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileScreen onSelectSaved={viewContent} /></ProtectedRoute>} />
          <Route path="/preview" element={<ProtectedRoute><PreviewScreen content={selectedContent} /></ProtectedRoute>} />
          <Route path="/feed/:id" element={<ProtectedRoute><FeedDetailScreen /></ProtectedRoute>} />
          <Route path="/meditation" element={<ProtectedRoute><MeditationScreen /></ProtectedRoute>} />
          <Route path="/featured-series" element={<ProtectedRoute><FeaturedSeriesScreen /></ProtectedRoute>} />
          <Route path="/featured-series/:seriesId" element={<ProtectedRoute><FeaturedSeriesDetailScreen /></ProtectedRoute>} />
          <Route path="/featured-series/:seriesId/:episodeId" element={<ProtectedRoute><FeaturedEpisodeScreen /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPipelineScreen onRefine={viewContent} /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>

      {!isAuthPage && !location.pathname.startsWith('/preview') && !location.pathname.startsWith('/chat') && !location.pathname.startsWith('/feed/') && !location.pathname.startsWith('/featured-series') && !location.pathname.startsWith('/meditation') && session && (
        <nav className="fixed bottom-0 left-0 right-0 glass z-[100] border-t border-white/5 pb-8 pt-3 max-w-md mx-auto">
          <div className="flex items-end justify-around px-4">
            {[
              { path: '/home', label: 'Home', icon: 'home' },
              { path: '/discover', label: 'Discover', icon: 'explore' },
              ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: 'admin_panel_settings' }] : []),
              { path: '/profile', label: 'Profile', icon: 'person' }
            ].map(item => (
              <button 
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 w-16 transition-colors ${location.pathname === item.path ? 'text-primary' : 'text-white/40'}`}
              >
                <span className={`material-symbols-outlined ${location.pathname === item.path ? 'fill-current' : ''}`}>{item.icon}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppErrorBoundary>
        <AppContent />
      </AppErrorBoundary>
    </Router>
  );
}
