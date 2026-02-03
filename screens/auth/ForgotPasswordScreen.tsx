
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../authService';

const ForgotPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authService.resetPasswordRequest(email);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col px-8 pt-20">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold text-white mb-2">Reset Password</h1>
        <p className="text-slate-400">We'll help you get back to your faith.</p>
      </div>

      {!submitted ? (
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

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {loading ? <span className="animate-spin material-symbols-outlined">refresh</span> : 'Send Reset Link'}
          </button>
        </form>
      ) : (
        <div className="bg-surface-dark border border-white/5 rounded-[32px] p-8 text-center animate-in zoom-in duration-300">
          <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">mark_email_read</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Email Sent</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            If an account exists for <span className="text-white font-bold">{email}</span>, you will receive a reset link shortly.
          </p>
          <Link to="/signin" className="inline-block w-full bg-primary text-white font-bold py-4 rounded-2xl">Return to Sign In</Link>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to="/signin" title="Back to Sign In" className="text-slate-500 text-sm font-bold">Nevermind, I remember it</Link>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
