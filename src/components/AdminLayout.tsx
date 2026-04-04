import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Settings, LogOut, UserRound, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/appointments' },
    { icon: UserRound, label: 'Doctors', path: '/doctors' },
    { icon: Settings, label: 'Clinic Settings', path: '/settings' },
    { icon: Shield, label: 'Admin Users', path: '/admin-management' },
  ];

  const currentTitle = menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0C0C0C]">
      {/* ── Mobile Top Navbar — 56px, 44px touch targets ── */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 bg-[#0C0C0C] border-b border-[#2A2A2A] sticky top-0 z-50">
        <Link to="/dashboard" className="flex items-center gap-2.5 min-h-[44px] hover:bg-[#1C1C1C] rounded-lg px-2 transition-all duration-200 ease-in-out">
          {/* TODO: add logo.png to /public/ */}
          <div className="w-8 h-8 bg-[#126209] rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">G</div>
          <span className="font-semibold text-sm text-[#F0EDE8]">ClinicOS Gulf</span>
        </Link>
        <label htmlFor="mobile-menu-toggle" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#8A8A8A] hover:bg-[#1C1C1C] rounded-lg cursor-pointer transition-all duration-200 ease-in-out">
          <Menu size={22} />
        </label>
      </div>

      <input type="checkbox" id="mobile-menu-toggle" className="peer hidden" />

      {/* Mobile overlay */}
      <label htmlFor="mobile-menu-toggle" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 hidden peer-checked:block md:hidden transition-all duration-200 ease-in-out" />

      {/* ── Sidebar — 240px desktop, full-screen drawer on mobile ── */}
      <aside className="fixed inset-y-0 left-0 w-[280px] sm:w-60 bg-[#141414] border-r border-[#2A2A2A] flex flex-col z-50 transform -translate-x-full peer-checked:translate-x-0 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-60 overflow-y-auto">
        {/* Logo */}
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 min-h-[44px] hover:bg-[#1C1C1C] rounded-lg px-2 transition-all duration-200 ease-in-out">
            {/* TODO: add logo.png to /public/ */}
            <div className="w-8 h-8 bg-[#126209] rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">G</div>
            <span className="font-semibold text-sm text-[#F0EDE8]">ClinicOS Gulf</span>
          </Link>
          <label htmlFor="mobile-menu-toggle" className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-[#8A8A8A] hover:text-[#F0EDE8] cursor-pointer transition-all duration-200 ease-in-out">
            <X size={20} />
          </label>
        </div>

        {/* Section label */}
        <div className="section-label">Main Menu</div>

        {/* Nav items — 44px min touch targets */}
        <nav className="flex-1 px-3 pb-4 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 min-h-[44px] rounded-lg transition-all duration-200 ease-in-out text-sm ${
                  isActive
                    ? 'bg-[#126209]/20 text-[#4ADE80] border-l-2 border-[#126209] font-medium'
                    : 'text-[#8A8A8A] hover:bg-[#1C1C1C] hover:text-[#F0EDE8] border-l-2 border-transparent'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user info + logout */}
        <div className="p-3 border-t border-[#2A2A2A] space-y-1">
          {admin && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-[#1C1C1C] border border-[#2A2A2A] flex items-center justify-center text-xs font-semibold text-[#8A8A8A] uppercase shrink-0">
                {admin.email?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#F0EDE8] truncate font-medium">{admin.email}</p>
                <p className="text-[10px] text-[#555555] uppercase tracking-[0.06em]">{admin.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 min-h-[44px] text-[#8A8A8A] hover:text-[#F87171] hover:bg-[#C0392B]/10 rounded-lg transition-all duration-200 ease-in-out text-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-x-hidden">
        {/* Desktop top header bar — 56px */}
        <header className="hidden md:flex items-center justify-between h-14 px-6 bg-[#0C0C0C] border-b border-[#2A2A2A] sticky top-0 z-30">
          <h2 className="text-sm font-semibold text-[#F0EDE8] tracking-heading">{currentTitle}</h2>
          <div className="flex items-center gap-3">
            {admin && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1C1C1C] border border-[#2A2A2A] flex items-center justify-center text-[10px] font-semibold text-[#8A8A8A] uppercase">
                  {admin.email?.charAt(0) || 'A'}
                </div>
                <span className="text-xs text-[#8A8A8A]">{admin.email}</span>
              </div>
            )}
          </div>
        </header>

        {/* Content — responsive padding */}
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6 overflow-x-hidden">
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;