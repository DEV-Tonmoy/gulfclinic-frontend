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
        // Aligned with app.ts route prefix: /api/appointments + /stats
        const response = await api.get('/api/appointments/stats');
        
        if (response.data && response.data.success) {
          setStats(response.data.stats);
        } else {
          console.warn("Backend reported failure or unauthorized");
        }
      } catch (err) {
        console.error("Failed to load dashboard stats - Check if Admin is logged in");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-1/3 bg-obsidian-raised rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-obsidian-raised rounded-2xl border border-obsidian-border-subtle" />)}
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Appointments', value: stats?.total ?? 0, icon: Users, color: 'text-status-info', bg: 'bg-status-info/10', border: 'border-status-info/20' },
    { label: 'New Today', value: stats?.newToday ?? 0, icon: Clock, color: 'text-gulf-gold', bg: 'bg-gulf-gold/10', border: 'border-gulf-gold/20' },
    { label: 'AI Handled', value: stats?.aiHandled ?? 0, icon: Bot, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    { label: 'Success Rate', value: stats?.conversionRate ?? '0%', icon: TrendingUp, color: 'text-status-success', bg: 'bg-status-success/10', border: 'border-status-success/20' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div>
        <h1 className="heading-lg">Clinic Overview</h1>
        <p className="text-body mt-1">Real-time performance of your AI booking engine.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {cards.map((card, i) => (
          <div key={i} className="card-surface p-5 flex items-center gap-4 hover:border-obsidian-border-strong transition-all duration-200 group">
            <div className={`${card.bg} ${card.color} p-3 rounded-xl border ${card.border} transition-all duration-200`}>
              <card.icon size={22} />
            </div>
            <div>
              <p className="label-caps text-[10px]">{card.label}</p>
              <p className="text-2xl font-semibold tracking-heading text-text-primary mt-0.5">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-surface p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <CalendarCheck className="text-gulf-green" size={20} />
          <h2 className="text-lg font-semibold tracking-heading text-text-primary">System Status</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-t border-obsidian-border-subtle pt-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-text-primary">AI Appointment Agent is Live</p>
            <p className="text-xs text-text-muted">Your AI is currently monitoring incoming messages and booking patients.</p>
          </div>
          <div className="px-4 py-2 bg-status-success/10 text-status-success text-[10px] font-semibold rounded-full border border-status-success/20 flex items-center gap-2 shadow-sm tracking-caps uppercase shrink-0">
            <span className="w-2 h-2 bg-status-success rounded-full animate-pulse" />
            {stats && stats.total > 0 ? 'OPERATIONAL' : 'WAITING FOR DATA'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;