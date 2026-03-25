import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Settings, LogOut, Activity, UserRound, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/appointments' },
    { icon: UserRound, label: 'Doctors', path: '/doctors' },
    { icon: Settings, label: 'Clinic Settings', path: '/settings' },
    { icon: Shield, label: 'Admin Users', path: '/admin-management' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">G</div>
          <span className="font-bold text-slate-800">Gulf Clinic</span>
        </div>
        <label htmlFor="mobile-menu-toggle" className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">
          <Menu size={24} />
        </label>
      </div>

      <input type="checkbox" id="mobile-menu-toggle" className="peer hidden" />

      {/* Mobile Sidebar Overlay */}
      <label htmlFor="mobile-menu-toggle" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 hidden peer-checked:block md:hidden transition-opacity" />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col z-50 transform -translate-x-full peer-checked:translate-x-0 transition-transform duration-300 md:relative md:translate-x-0 md:w-64">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
            <span className="font-bold text-slate-800 text-lg">Gulf Clinic</span>
          </div>
          <label htmlFor="mobile-menu-toggle" className="md:hidden p-2 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={20} />
          </label>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === item.path ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-semibold">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;