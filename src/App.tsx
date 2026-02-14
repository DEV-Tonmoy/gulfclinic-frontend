import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AppointmentList from './pages/AppointmentList';
import SettingsPage from './pages/SettingsPage';
import DashboardHome from './pages/DashboardHome'; // Add this import
import AdminLayout from './components/AdminLayout';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { admin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-clinic-600 font-medium animate-pulse">
          Verifying Session...
        </div>
      </div>
    );
  }

  if (!admin) {
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
          {/* Use the new DashboardHome component here */}
          <Route path="/dashboard" element={<DashboardHome />} />
          
          <Route path="/appointments" element={<AppointmentList />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;