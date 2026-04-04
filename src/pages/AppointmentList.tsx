import { useEffect, useState } from 'react';
import { Search, X, Trash2, Phone, User as UserIcon, AlertCircle, Bot } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

interface Appointment {
  id: string; fullName: string; phone: string; status: 'NEW'|'CONTACTED'|'CLOSED';
  isAi: boolean; source?: string|null; createdAt: string;
}
interface AiAppointment {
  id: string; patient_name: string|null; patient_phone: string|null; patient_email: string|null;
  service_requested: string|null; preferred_date: string|null; preferred_time: string|null;
  status: string|null; source: string|null; doctor_assigned: string|null; created_at: string; branch: string|null;
}
type TabType = 'all'|'nour';

const AppointmentList = () => {
  const { admin, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedApt, setSelectedApt] = useState<Appointment|null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const isSuperAdmin = admin?.role?.toString().toUpperCase() === 'SUPER_ADMIN';

  const fetchAppointments = async () => {
    try { setLoading(true); const response = await api.get(`/api/appointments/list?search=${search}`);
      if (response.data?.data) setAppointments(response.data.data);
    } catch (error) {} finally { setLoading(false); }
  };
  useEffect(() => { const timer = setTimeout(() => { fetchAppointments(); }, 400); return () => clearTimeout(timer); }, [search]);

  const handleUpdateStatus = async (newStatus: Appointment['status']) => {
    if (!selectedApt) return;
    try { setIsUpdating(true); await api.patch(`/api/appointments/${selectedApt.id}/status`, { status: newStatus });
      setAppointments(prev => prev.map(a => a.id === selectedApt.id ? { ...a, status: newStatus } : a));
      setSelectedApt(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) { alert('Failed to update status.'); } finally { setIsUpdating(false); }
  };
  const handleDelete = async () => {
    if (!selectedApt || !window.confirm('Delete this appointment?')) return;
    try { setIsUpdating(true); await api.delete(`/api/appointments/${selectedApt.id}`);
      setAppointments(prev => prev.filter(a => a.id !== selectedApt.id)); setSelectedApt(null);
    } catch (error) { alert('Failed to delete.'); } finally { setIsUpdating(false); }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-[#3498DB]/15 text-[#3498DB] border-[#3498DB]/25';
      case 'CONTACTED': return 'bg-[#F39C12]/15 text-[#F39C12] border-[#F39C12]/25';
      case 'CLOSED': return 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/25';
      default: return 'bg-[#1C1C1C] text-[#8A8A8A]';
    }
  };
  const getNourStatusStyle = (status: string|null) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/25';
      case 'pending': return 'bg-[#3498DB]/15 text-[#3498DB] border-[#3498DB]/25';
      case 'cancelled': return 'bg-[#C0392B]/15 text-[#C0392B] border-[#C0392B]/25';
      case 'completed': return 'bg-purple-400/15 text-purple-400 border-purple-400/25';
      default: return 'bg-[#1C1C1C] text-[#8A8A8A] border-[#2A2A2A]';
    }
  };

  const SourceBadge = ({apt}:{apt:Appointment}) => {
    if (apt.source === 'WEBSITE') return <span className="inline-flex items-center gap-1 text-[#3498DB] bg-[#3498DB]/10 px-2 py-0.5 rounded text-[10px] font-semibold border border-[#3498DB]/20">🌐 WEBSITE</span>;
    if (apt.source === 'ai_chatbot' || apt.isAi) return <span className="inline-flex items-center gap-1 text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded text-[10px] font-semibold border border-purple-400/20"><Bot size={12}/> AI</span>;
    return <span className="text-[#555555] text-[10px] font-medium uppercase tracking-[0.06em]">Manual</span>;
  };

  return (
    <div className="relative space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="heading-lg">Appointment Requests</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]" size={18} />
          <input type="text" placeholder="Search patients..." className="input-field pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* ── Desktop Table (hidden on mobile) ── */}
      <div className="hidden md:block card-surface overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#1C1C1C] border-b border-[#2A2A2A]">
            <tr>
              <th className="px-5 py-3 text-[10px] uppercase text-[#555555] tracking-widest font-medium">Patient</th>
              <th className="px-5 py-3 text-[10px] uppercase text-[#555555] tracking-widest font-medium">Phone</th>
              <th className="px-5 py-3 text-[10px] uppercase text-[#555555] tracking-widest font-medium">Source</th>
              <th className="px-5 py-3 text-[10px] uppercase text-[#555555] tracking-widest font-medium">Date</th>
              <th className="px-5 py-3 text-[10px] uppercase text-[#555555] tracking-widest font-medium">Status</th>
              <th className="px-5 py-3 text-[10px] uppercase text-[#555555] tracking-widest font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C1C]">
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-[#8A8A8A] text-sm">Loading...</td></tr>
            ) : appointments.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-[#8A8A8A] text-sm">No appointments found.</td></tr>
            ) : appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-[#141414] transition-all duration-200 ease-in-out">
                <td className="px-5 py-3.5 font-medium text-[#F0EDE8] text-sm">{apt.fullName}</td>
                <td className="px-5 py-3.5 text-[#8A8A8A] font-mono text-sm">{apt.phone}</td>
                <td className="px-5 py-3.5"><SourceBadge apt={apt}/></td>
                <td className="px-5 py-3.5 text-[#8A8A8A] text-sm">{new Date(apt.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3.5"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusStyle(apt.status)}`}>{apt.status}</span></td>
                <td className="px-5 py-3.5 text-right">
                  <button onClick={() => setSelectedApt(apt)} className="text-[#126209] hover:text-[#1A8A0C] text-sm font-medium min-h-[44px] px-2 transition-all duration-200 ease-in-out">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Card Stack (hidden on desktop) ── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-10 text-[#8A8A8A] text-sm">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-10 text-[#8A8A8A] text-sm">No appointments found.</div>
        ) : appointments.map((apt) => (
          <button key={apt.id} onClick={() => setSelectedApt(apt)}
            className="w-full text-left card-surface p-4 space-y-3 active:scale-[0.98] transition-all duration-200 ease-in-out hover:border-[#3A3A3A]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#F0EDE8] truncate pr-2">{apt.fullName}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border shrink-0 ${getStatusStyle(apt.status)}`}>{apt.status}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8A8A8A] font-mono">{apt.phone}</span>
              <span className="text-[#555555]">{new Date(apt.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <SourceBadge apt={apt}/>
              <span className="text-[#126209] text-xs font-medium">View →</span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Detail Panel: Side sheet on desktop, Bottom sheet on mobile ── */}
      {selectedApt && (<>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-200 ease-in-out" onClick={() => setSelectedApt(null)} />
        <div className="fixed z-50 flex flex-col bg-[#141414] border border-[#2A2A2A] shadow-elevated-lg
          inset-x-0 bottom-0 rounded-t-2xl max-h-[85vh]
          sm:inset-y-0 sm:inset-x-auto sm:right-0 sm:left-auto sm:w-full sm:max-w-md sm:rounded-t-none sm:rounded-l-none sm:max-h-full
          animate-slide-in-right sm:animate-slide-in-right">

          <div className="p-5 border-b border-[#2A2A2A] flex justify-between items-center">
            {/* Mobile drag indicator */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-[#3A3A3A] rounded-full sm:hidden" />
            <h2 className="text-lg font-semibold text-[#F0EDE8] tracking-heading">Appointment Details</h2>
            <button onClick={() => setSelectedApt(null)} className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-[#1C1C1C] rounded-lg transition-all duration-200 ease-in-out">
              <X size={20} className="text-[#8A8A8A]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-[#8A8A8A]"><UserIcon size={16}/><span className="label-caps text-[10px]">Patient</span></div>
                {(selectedApt.source==='WEBSITE'||selectedApt.source==='ai_chatbot'||selectedApt.isAi)&&(
                  <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${selectedApt.source==='WEBSITE'?'text-[#3498DB] bg-[#3498DB]/10 border-[#3498DB]/20':'text-purple-400 bg-purple-400/10 border-purple-400/20'}`}>
                    {selectedApt.source==='WEBSITE'?'🌐 Website':<><Bot size={12}/> AI</>}
                  </span>
                )}
              </div>
              <div className="bg-[#1C1C1C] p-4 rounded-xl border border-[#2A2A2A] space-y-2.5">
                <div><p className="text-[10px] text-[#555555] uppercase tracking-[0.06em] font-medium">Full Name</p><p className="text-[#F0EDE8] font-medium text-sm mt-0.5">{selectedApt.fullName}</p></div>
                <div className="flex items-center gap-2"><Phone size={14} className="text-[#126209]"/><p className="text-[#8A8A8A] font-mono text-sm">{selectedApt.phone}</p></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#8A8A8A]"><AlertCircle size={16}/><span className="label-caps text-[10px]">Status</span></div>
              <div className="grid grid-cols-1 gap-2">
                {(['NEW','CONTACTED','CLOSED'] as Appointment['status'][]).map((status) => (
                  <button key={status} disabled={isUpdating} onClick={() => handleUpdateStatus(status)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-sm font-medium min-h-[44px] transition-all duration-200 ease-in-out
                      ${selectedApt.status===status?`${getStatusStyle(status)} ring-1 ring-current`:'bg-[#1C1C1C] border-[#2A2A2A] text-[#8A8A8A] hover:border-[#3A3A3A] hover:text-[#F0EDE8]'}`}>
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-[#2A2A2A] bg-[#1C1C1C]/50">
            {!authLoading && (isSuperAdmin ? (
              <button onClick={handleDelete} disabled={isUpdating}
                className="w-full btn-danger-ghost flex items-center justify-center gap-2 min-h-[44px]">
                <Trash2 size={18}/>{isUpdating?'Processing...':'Delete Appointment'}
              </button>
            ) : (
              <div className="text-center p-3 bg-[#1C1C1C] rounded-lg border border-[#2A2A2A]">
                <p className="text-[10px] text-[#555555] uppercase tracking-[0.06em] font-medium">View-Only Mode</p>
                <p className="text-[10px] text-[#555555] mt-1">Role: <span className="text-[#8A8A8A] font-medium">{admin?.role||'Unknown'}</span></p>
              </div>
            ))}
          </div>
        </div>
      </>)}
    </div>
  );
};

export default AppointmentList;