import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, Stethoscope } from 'lucide-react';
import api from '../api/axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Axios uses the BASE_URL from axios.ts, so we just need the endpoint
      console.log("Attempting login at:", email);
      const response = await api.post('/admin/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('admin_token', response.data.token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Login Error Object:", err);
      
      if (err.code === 'ERR_NETWORK') {
        // This usually triggers if the URL is wrong or CORS preflight fails
        setError('Network Error: Backend might be sleeping or CORS is blocking.');
      } else {
        setError(err.response?.data?.message || 'Invalid credentials or Server Error.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Stethoscope className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Gulf Clinic Admin</h1>
          <p className="text-slate-500 text-sm mt-1">Please sign in to manage appointments</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition bg-slate-50/50"
                placeholder="admin@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition bg-slate-50/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

// FIXED: Added the default export so App.tsx can find the component
export default LoginPage;