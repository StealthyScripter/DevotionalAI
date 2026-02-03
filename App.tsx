
import React, { useState, useEffect } from 'react';
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

/**
 * Floating Chat Button for quick access to the AI Pastor
 */
function FloatingPastorButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = authService.getSession();

  const isAuthPage = ['/', '/signin', '/signup', '/verify-2fa', '/forgot-password'].includes(location.pathname);
  const isChatPage = location.pathname === '/chat';
  const isPreviewPage = location.pathname === '/preview';

  if (!session || isAuthPage || isChatPage || isPreviewPage) return null;

  return (
    <button
      onClick={() => navigate('/chat')}
      className="fixed bottom-28 right-6 z-[90] size-14 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center transition-all hover:scale-110 active:scale-90 glowing-button border-4 border-background-dark animate-bounce-subtle"
      aria-label="Ask Pastor AI"
    >
      <span className="material-symbols-outlined text-2xl">forum</span>
      <div className="absolute top-0 right-0 size-3.5 bg-green-500 rounded-full border-2 border-background-dark">
        <div className="size-full bg-green-500 rounded-full animate-ping opacity-75"></div>
      </div>
    </button>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  const [session, setSession] = useState<AuthSession | null>(authService.getSession());

  useEffect(() => {
    const checkSession = () => setSession(authService.getSession());
    window.addEventListener('storage', checkSession);
    const interval = setInterval(checkSession, 1000);
    return () => {
      window.removeEventListener('storage', checkSession);
      clearInterval(interval);
    };
  }, []);

  const viewContent = (content: GeneratedContent) => {
    setSelectedContent(content);
    navigate('/preview');
  };

  const isAuthPage = ['/', '/signin', '/signup', '/verify-2fa', '/forgot-password'].includes(location.pathname);
  const hideNav = isAuthPage || location.pathname === '/preview' || location.pathname === '/chat';

  const isAdmin = session?.user.role === Role.Admin;

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative bg-background-dark shadow-2xl overflow-x-hidden font-sans">
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <Routes>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/signin" element={<SignInScreen onLoginSuccess={() => setSession(authService.getSession())} />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/verify-2fa" element={<TwoFactorScreen onLoginSuccess={() => setSession(authService.getSession())} />} />
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

      <FloatingPastorButton />

      {!hideNav && session && (
        <nav className="fixed bottom-0 left-0 right-0 glass z-[100] border-t border-white/5 pb-8 pt-3">
          <div className="max-w-md mx-auto flex items-end justify-around px-4 relative">
            <button 
              type="button"
              onClick={() => navigate('/home')}
              className={`flex flex-col items-center gap-1 w-16 transition-colors ${location.pathname === '/home' ? 'text-primary' : 'text-white/40'}`}
            >
              <span className={`material-symbols-outlined ${location.pathname === '/home' ? 'fill-current' : ''}`}>home</span>
              <span className="text-[9px] font-bold">Home</span>
            </button>

            <button 
              type="button"
              onClick={() => navigate('/discover')}
              className={`flex flex-col items-center gap-1 w-16 transition-colors ${location.pathname === '/discover' ? 'text-primary' : 'text-white/40'}`}
            >
              <span className={`material-symbols-outlined ${location.pathname === '/discover' ? 'fill-current' : ''}`}>explore</span>
              <span className="text-[9px] font-bold">Discover</span>
            </button>

            {isAdmin && (
              <button 
                type="button"
                onClick={() => navigate('/admin')}
                className={`flex flex-col items-center gap-1 w-16 transition-colors ${location.pathname === '/admin' ? 'text-primary' : 'text-white/40'}`}
              >
                <span className={`material-symbols-outlined ${location.pathname === '/admin' ? 'fill-current' : ''}`}>admin_panel_settings</span>
                <span className="text-[9px] font-bold">Admin</span>
              </button>
            )}

            <button 
              type="button"
              onClick={() => navigate('/profile')}
              className={`flex flex-col items-center gap-1 w-16 transition-colors ${location.pathname === '/profile' ? 'text-primary' : 'text-white/40'}`}
            >
              <span className={`material-symbols-outlined ${location.pathname === '/profile' ? 'fill-current' : ''}`}>person</span>
              <span className="text-[9px] font-bold">Profile</span>
            </button>
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
