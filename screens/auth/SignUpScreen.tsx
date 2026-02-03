
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../authService';

const SignUpScreen: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }

    setLoading(true);
    try {
      const result = await authService.signUp(email, password);
      if (result.success) {
        setSuccess('Account created! Please verify your email using code: VERIFY-777');
        // Simulate email verification immediately for demo ease
        setTimeout(async () => {
          await authService.verifyEmail(email);
          navigate('/signin');
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col px-8 pt-20">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold text-white mb-2">Join the Flock</h1>
        <p className="text-slate-400">Start your personalized spiritual path.</p>
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
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-dark border-slate-800 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            placeholder="At least 8 characters"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Confirm Password</label>
          <input 
            type="password" 
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
            <p className="text-green-500 text-xs font-bold">{success}</p>
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {loading ? <span className="animate-spin material-symbols-outlined">refresh</span> : 'Create Account'}
        </button>
      </form>

      <div className="mt-auto pb-12 text-center">
        <p className="text-slate-500 text-sm">
          Already have an account? <Link to="/signin" className="text-primary font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpScreen;
