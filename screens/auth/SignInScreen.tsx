
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../authService';

interface Props {
  onLoginSuccess: () => void;
}

const SignInScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await authService.signIn(email, password);
      if (result.success) {
        if (result.requires2FA) {
          navigate('/verify-2fa');
        } else {
          onLoginSuccess();
          navigate('/home');
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('A system error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col px-8 pt-20">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-slate-400">Continue your spiritual journey.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-dark border-slate-800 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            placeholder="name@example.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between px-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
            <Link to="/forgot-password" title="Forgot Password" className="text-xs text-primary font-bold">Forgot?</Link>
          </div>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-dark border-slate-800 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500 text-sm">error</span>
            <p className="text-red-500 text-xs font-bold">{error}</p>
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {loading ? <span className="animate-spin material-symbols-outlined">refresh</span> : 'Sign In'}
        </button>
      </form>

      <div className="mt-auto pb-12 text-center">
        <p className="text-slate-500 text-sm">
          New here? <Link to="/signup" className="text-primary font-bold">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default SignInScreen;
