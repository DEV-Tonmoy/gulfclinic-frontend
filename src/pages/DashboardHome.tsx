import { useEffect, useState } from 'react';
import { Users, Bot, CalendarCheck, TrendingUp, Clock } from 'lucide-react';
import api from '../api/axios';

interface DashboardStats {
  total: number;
  newToday: number;
  aiHandled: number;
  conversionRate: string;
}

const DashboardHome = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        // Check both response.data.success and nested data structure
        if (response.data && response.data.success) {
          setStats(response.data.stats);
        } else {
          // Fallback if backend returns success: false
          console.warn("Backend reported failure, using default stats");
        }
      } catch (err) {
        console.error("Failed to load dashboard stats - Backend route may be missing");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="h-20 w-1/3 bg-slate-200 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Appointments', value: stats?.total ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'New Today', value: stats?.newToday ?? 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'AI Handled', value: stats?.aiHandled ?? 0, icon: Bot, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Success Rate', value: stats?.conversionRate ?? '0%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Clinic Overview</h1>
        <p className="text-slate-500">Real-time performance of your AI booking engine.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
            <div className={`${card.bg} ${card.color} p-3 rounded-xl`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <CalendarCheck className="text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">System Status</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-t border-slate-50 pt-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-700">AI Appointment Agent is Live</p>
            <p className="text-xs text-slate-400">Your AI is currently monitoring incoming messages and booking patients.</p>
          </div>
          <div className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            OPERATIONAL
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;