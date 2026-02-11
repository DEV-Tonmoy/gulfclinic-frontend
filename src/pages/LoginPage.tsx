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
    e.preventDefault(); // Prevents the browser from reloading the page
    console.log("Login process started for:", email);
    
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/admin/login', { email, password });
      console.log("Login Success:", response.data);
      
      // If successful, redirect to the dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Login Catch Block Error:", err);
      
      // If there's no response (CORS or Network error), err.response will be undefined
      if (!err.response) {
        setError('Connection error: The backend might be blocking this request (CORS) or is offline.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-clinic-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-clinic-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-clinic-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-clinic-900">Gulf Clinic Admin</h1>
          <p className="text-slate-500 text-sm mt-1">Please sign in to manage appointments</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-600 focus:border-transparent outline-none transition"
                placeholder="admin@gulfclinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-600 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-clinic-600 hover:bg-clinic-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;