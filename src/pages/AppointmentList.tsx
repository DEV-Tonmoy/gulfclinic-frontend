import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../api/axios';

interface Appointment {
  id: string;
  fullName: string;
  phone: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  createdAt: string;
}

const AppointmentList = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/appointments?search=${search}`);
      setAppointments(response.data.data);
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [search]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CONTACTED': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CLOSED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
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
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date Received</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Loading appointments...</td></tr>
            ) : appointments.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">No appointments found.</td></tr>
            ) : (
              appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-800">{apt.fullName}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{apt.phone}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(apt.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(apt.status)}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => alert(`Open details for ${apt.id}`)}
                      className="text-clinic-600 hover:text-clinic-700 text-sm font-semibold"
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
  );
};

export default AppointmentList;