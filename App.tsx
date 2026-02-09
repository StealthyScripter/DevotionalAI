
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import LandingScreen from './screens/LandingScreen';
import HomeScreen from './screens/HomeScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import ProfileScreen from './screens/ProfileScreen';
import PreviewScreen from './screens/PreviewScreen';
import SettingsScreen from './screens/SettingsScreen';
import ChatScreen from './screens/ChatScreen';
import AdminPipelineScreen from './screens/AdminPipelineScreen';
import SignInScreen from './screens/auth/SignInScreen';
import SignUpScreen from './screens/auth/SignUpScreen';
import TwoFactorScreen from './screens/auth/TwoFactorScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import { GeneratedContent, AuthSession, Role } from './types';
import { authService } from './authService';

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
    window.addEventListener('storage', syncSession);
    const interval = setInterval(syncSession, 2000);
    return () => {
      window.removeEventListener('storage', syncSession);
      clearInterval(interval);
    };
  }, [syncSession]);

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
          <Route path="/home" element={<ProtectedRoute><HomeScreen onViewMessage={viewContent} /></ProtectedRoute>} />
          <Route path="/discover" element={<ProtectedRoute><DiscoverScreen onSelectItem={viewContent} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileScreen onSelectSaved={viewContent} /></ProtectedRoute>} />
          <Route path="/preview" element={<ProtectedRoute><PreviewScreen content={selectedContent} /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPipelineScreen onRefine={viewContent} /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>

      {!isAuthPage && location.pathname !== '/preview' && location.pathname !== '/chat' && session && (
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
      <AppContent />
    </Router>
  );
}
