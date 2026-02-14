import { useEffect, useState } from 'react';
import { Search, X, Trash2, Phone, User as UserIcon, AlertCircle, Bot } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

interface Appointment {
  id: string;
  fullName: string;
  phone: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  isAi: boolean; // Added this to match our new backend logic
  createdAt: string;
}

const AppointmentList = () => {
  const { admin } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/appointments?search=${search}`);
      if (response.data && response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [search]);

  const handleUpdateStatus = async (newStatus: Appointment['status']) => {
    if (!selectedApt) return;
    try {
      setIsUpdating(true);
      await api.patch(`/admin/appointments/${selectedApt.id}`, { status: newStatus });
      setAppointments(prev => prev.map(a => a.id === selectedApt.id ? { ...a, status: newStatus } : a));
      setSelectedApt(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      alert("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedApt || !window.confirm("Delete this appointment?")) return;
    try {
      setIsUpdating(true);
      await api.delete(`/admin/appointments/${selectedApt.id}`);
      setAppointments(prev => prev.filter(a => a.id !== selectedApt.id));
      setSelectedApt(null);
    } catch (error) {
      alert("Failed to delete.");
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

  return (
    <div className="relative space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Appointment Requests</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-600 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
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
                  <td className="px-6 py-4 font-medium text-slate-800">{apt.fullName}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{apt.phone}</td>
                  <td className="px-6 py-4">
                    {apt.isAi ? (
                      <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-100">
                        <Bot size={12} /> AI AGENT
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Manual</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(apt.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(apt.status)}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedApt(apt)}
                      className="text-clinic-600 hover:text-clinic-800 text-sm font-semibold transition"
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

      {selectedApt && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={() => setSelectedApt(null)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
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
                  {selectedApt.isAi && (
                    <span className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">
                      <Bot size={14} /> Booked via AI
                    </span>
                  )}
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Full Name</p>
                    <p className="text-slate-800 font-semibold">{selectedApt.fullName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-clinic-600" />
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
              {admin?.role === 'SUPER_ADMIN' ? (
                <button
                  onClick={handleDelete}
                  disabled={isUpdating}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-all border border-red-200"
                >
                  <Trash2 size={18} />
                  Delete Appointment
                </button>
              ) : (
                <p className="text-center text-xs text-slate-400 font-medium">Deletion restricted to Super Admin</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AppointmentList;