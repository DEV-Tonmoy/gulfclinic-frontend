import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, Stethoscope } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { checkAuth } = useAuth(); 
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    await api.post('/admin/login', { email, password });

await checkAuth();
navigate('/dashboard');
  } catch (err: any) {
    if (err.message?.includes('waking up')) {
      setError('Service is starting up, please try again in 30 seconds.');
    } else if (err.code === 'ERR_NETWORK') {
      setError('Network Error: Backend might be sleeping or CORS is blocking.');
    } else {
      setError(err.response?.data?.message || 'Invalid credentials or server error.');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-obsidian-base flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gulf-green/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[300px] bg-gulf-gold/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative max-w-md w-full bg-obsidian-surface rounded-2xl shadow-elevated-lg p-8 border border-obsidian-border-subtle animate-fade-in">
        
        <div className="text-center mb-8">
          <div className="bg-gulf-green w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-glow-green">
            <Stethoscope className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-semibold tracking-heading text-text-primary">Gulf Clinic Admin</h1>
          <p className="text-text-muted text-sm mt-1">Please sign in to manage appointments</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-status-destructive/10 border border-status-destructive/20 text-status-destructive text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="label-caps block mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder" size={18} />
              <input
                type="email"
                required
                className="input-field pl-10"
                placeholder="admin@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label-caps block mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder" size={18} />
              <input
                type="password"
                required
                className="input-field pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary min-h-[44px] py-3 flex items-center justify-center gap-2 disabled:opacity-60 mt-2 text-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>

        {/* Bottom accent line */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-obsidian-border-subtle"></div>
          <span className="text-[10px] text-text-placeholder uppercase tracking-caps font-medium">ClinicOS Gulf</span>
          <div className="h-px flex-1 bg-obsidian-border-subtle"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;