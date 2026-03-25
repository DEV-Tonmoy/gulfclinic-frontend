import { useEffect, useState } from 'react';
import { Search, X, Trash2, Phone, User as UserIcon, AlertCircle, Bot } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

// --- EXISTING shape (website + AI agent bookings via backend) ---
interface Appointment {
  id: string;
  fullName: string;
  phone: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  isAi: boolean;
  source?: string | null;
  createdAt: string;
}

// --- NEW shape (Nour WhatsApp bookings from automation Supabase) ---
interface AiAppointment {
  id: string;
  patient_name: string | null;
  patient_phone: string | null;
  patient_email: string | null;
  service_requested: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: string | null;
  source: string | null;
  doctor_assigned: string | null;
  created_at: string;
  branch: string | null;
}

type TabType = 'all' | 'nour';

const AppointmentList = () => {
  const { admin, loading: authLoading } = useAuth();

  // Existing state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // New state
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [aiAppointments, setAiAppointments] = useState<AiAppointment[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const isSuperAdmin = admin?.role?.toString().toUpperCase() === 'SUPER_ADMIN';

  // --- Existing fetch (unchanged) ---
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/appointments/list?search=${search}`);
      if (response.data?.data) {
        setAppointments(response.data.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAppointments();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // --- New fetch: Nour bookings ---
  const fetchAiAppointments = async () => {
    try {
      setAiLoading(true);
      setAiError(null);
      const response = await api.get('/admin/ai-bookings');
      if (response.data?.data) {
        setAiAppointments(response.data.data);
      }
    } catch (error) {
      setAiError('Failed to load WhatsApp bookings. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'nour') {
      fetchAiAppointments();
    }
  }, [activeTab]);

  // --- Existing handlers (unchanged) ---
  const handleUpdateStatus = async (newStatus: Appointment['status']) => {
    if (!selectedApt) return;
    try {
      setIsUpdating(true);
      await api.patch(`/api/appointments/${selectedApt.id}/status`, { status: newStatus });
      setAppointments(prev => prev.map(a => a.id === selectedApt.id ? { ...a, status: newStatus } : a));
      setSelectedApt(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      alert('Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedApt || !window.confirm('Delete this appointment?')) return;
    try {
      setIsUpdating(true);
      await api.delete(`/api/appointments/${selectedApt.id}`);
      setAppointments(prev => prev.filter(a => a.id !== selectedApt.id));
      setSelectedApt(null);
    } catch (error) {
      alert('Failed to delete.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CONTACTED': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CLOSED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // --- New: Nour status styles ---
  const getNourStatusStyle = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'completed': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="relative space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Appointment Requests</h1>
        {activeTab === 'all' && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'all'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          All Bookings
        </button>
        <button
          onClick={() => setActiveTab('nour')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'nour'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          <Bot size={14} />
          WhatsApp Bookings (Nour)
        </button>
      </div>

      {/* ── TAB: ALL BOOKINGS (existing, unchanged) ── */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Patient</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Phone</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Source</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">Loading...</td></tr>
                ) : appointments.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">No appointments found.</td></tr>
                ) : (
                  appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">{apt.fullName}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-sm whitespace-nowrap">{apt.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {apt.source === 'WEBSITE' ? (
                          <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">
                            🌐 WEBSITE
                          </span>
                        ) : apt.source === 'ai_chatbot' || apt.isAi ? (
                          <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-100">
                            <Bot size={12} /> AI AGENT
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Manual</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                        {new Date(apt.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedApt(apt)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: WHATSAPP BOOKINGS (Nour) ── */}
      {activeTab === 'nour' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-green-600" />
              <span className="text-sm font-semibold text-slate-700">Bookings received via Nour AI on WhatsApp</span>
            </div>
            <button
              onClick={fetchAiAppointments}
              disabled={aiLoading}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition disabled:opacity-40"
            >
              {aiLoading ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>

          {aiError && (
            <div className="px-6 py-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
              {aiError}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Patient</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Phone</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Email</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Service</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Preferred Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Branch</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Doctor</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Booked On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aiLoading ? (
                  <tr><td colSpan={9} className="px-6 py-10 text-center text-slate-400 text-sm">Loading WhatsApp bookings...</td></tr>
                ) : aiAppointments.length === 0 ? (
                  <tr><td colSpan={9} className="px-6 py-10 text-center text-slate-400 text-sm">No WhatsApp bookings yet.</td></tr>
                ) : (
                  aiAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded text-[10px] font-bold border border-green-100">
                            📱 WHATSAPP
                          </span>
                          <span className="font-medium text-slate-800">{apt.patient_name ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-sm whitespace-nowrap">
                        {apt.patient_phone ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">
                        {apt.patient_email ?? <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">
                        {apt.service_requested ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                        {apt.preferred_date
                          ? new Date(apt.preferred_date).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap capitalize">
                        {apt.branch ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">
                        {apt.doctor_assigned ?? '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${getNourStatusStyle(apt.status)}`}>
                          {apt.status ?? 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                        {new Date(apt.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DETAIL PANEL (existing, unchanged) ── */}
      {selectedApt && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={() => setSelectedApt(null)} />
          <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Appointment Details</h2>
              <button onClick={() => setSelectedApt(null)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-500">
                    <UserIcon size={18} />
                    <span className="text-sm font-medium uppercase tracking-wider">Patient Information</span>
                  </div>
                  {(selectedApt.source === 'WEBSITE' || selectedApt.source === 'ai_chatbot' || selectedApt.isAi) && (
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${selectedApt.source === 'WEBSITE'
                        ? 'text-blue-600 bg-blue-50 border-blue-200'
                        : 'text-purple-600 bg-purple-50 border-purple-200'
                      }`}>
                      {selectedApt.source === 'WEBSITE' ? '🌐 Website Form' : <><Bot size={14} /> Booked via AI</>}
                    </span>
                  )}
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Full Name</p>
                    <p className="text-slate-800 font-semibold">{selectedApt.fullName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-blue-600" />
                    <p className="text-slate-700 font-mono">{selectedApt.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-500">
                  <AlertCircle size={18} />
                  <span className="text-sm font-medium uppercase tracking-wider">Manage Status</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {(['NEW', 'CONTACTED', 'CLOSED'] as Appointment['status'][]).map((status) => (
                    <button
                      key={status}
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(status)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-sm font-bold transition
                        ${selectedApt.status === status
                          ? `${getStatusStyle(status)} border-current ring-1 ring-current`
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}
                      `}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50">
              {!authLoading && (
                isSuperAdmin ? (
                  <button
                    onClick={handleDelete}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-all border border-red-200 shadow-sm"
                  >
                    <Trash2 size={18} />
                    {isUpdating ? 'Processing...' : 'Delete Appointment'}
                  </button>
                ) : (
                  <div className="text-center p-3 bg-slate-100 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-tight">View-Only Mode</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Deletion is restricted to Super Admin. Your role is: <span className="font-bold text-slate-600">{admin?.role || 'Unknown'}</span>
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AppointmentList;