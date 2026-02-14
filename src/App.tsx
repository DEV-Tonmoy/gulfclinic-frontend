import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AppointmentList from './pages/AppointmentList';
import SettingsPage from './pages/SettingsPage';
import DashboardHome from './pages/DashboardHome';
import AdminLayout from './components/AdminLayout';
import { useAuth } from './hooks/useAuth';

// Improved ProtectedRoute to handle the "Verifying" state better
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { admin, loading } = useAuth();
  const hasToken = !!localStorage.getItem('admin_token');

  // If we are loading but have a token, show the spinner but DON'T redirect yet
  if (loading && hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium animate-pulse">Verifying Session...</p>
        </div>
      </div>
    );
  }

  // Only redirect if we are finished loading AND there is no admin found
  if (!loading && !admin) {
    console.log("[AUTH] No session found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Shell */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/appointments" element={<AppointmentList />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Internal redirect from base protected path to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Global Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;