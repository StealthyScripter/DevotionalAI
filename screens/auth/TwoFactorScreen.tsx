
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../authService';

interface Props {
  onLoginSuccess: () => void;
}

const TwoFactorScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('temp_2fa_code')) {
      navigate('/signin');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (code.length !== 6) {
      return setError('Code must be 6 digits.');
    }

    setLoading(true);
    try {
      const result = await authService.verify2FA(code);
      if (result.success) {
        onLoginSuccess();
        navigate('/home');
      } else {
        setError(result.message || 'Invalid code.');
      }
    } catch (err) {
      setError('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setResending(true);
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('temp_2fa_code', newCode);
    console.log(`[SIMULATED SMS/EMAIL] New 2FA Login Code: ${newCode}`);
    setTimeout(() => {
      setResending(false);
      alert('A new code has been sent (check console).');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col px-8 pt-20">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold text-white mb-2">Verify It's You</h1>
        <p className="text-slate-400">Enter the 6-digit code sent to your email.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <input 
            type="text" 
            maxLength={6}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full bg-surface-dark border-slate-800 rounded-2xl py-6 px-5 text-center text-4xl font-bold tracking-[0.5em] text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            placeholder="000000"
          />
          <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Code expires in 10 minutes</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500 text-sm">error</span>
            <p className="text-red-500 text-xs font-bold">{error}</p>
          </div>
        )}

        <button 
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? <span className="animate-spin material-symbols-outlined">refresh</span> : 'Verify Code'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button 
          onClick={handleResend}
          disabled={resending}
          className="text-primary text-sm font-bold disabled:opacity-50"
        >
          {resending ? 'Sending...' : "Didn't receive a code? Resend"}
        </button>
      </div>

      <div className="mt-auto pb-12 text-center">
        <button onClick={() => navigate('/signin')} className="text-slate-500 text-sm font-bold">Back to Sign In</button>
      </div>
    </div>
  );
};

export default TwoFactorScreen;
