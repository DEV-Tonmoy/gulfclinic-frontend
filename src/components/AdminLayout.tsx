import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  LogOut, 
  Stethoscope,
  User
} from 'lucide-react';
import api from '../api/axios';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout');
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
      // Even if API fails, clear local view
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-clinic-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-clinic-700">
          <Stethoscope className="text-clinic-100" size={24} />
          <span className="font-bold text-lg tracking-tight">Gulf Clinic</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-clinic-700 transition">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/appointments" className="flex items-center gap-3 p-3 rounded-lg hover:bg-clinic-700 transition">
            <ClipboardList size={20} />
            <span>Appointments</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-clinic-700">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-600 transition text-red-100"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="bg-clinic-100 p-2 rounded-full">
              <User size={18} className="text-clinic-600" />
            </div>
            <span className="text-sm font-medium">Admin Panel</span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <section className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;