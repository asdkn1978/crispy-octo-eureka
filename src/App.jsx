import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Landing from './pages/Landing';
import LoginModal from './components/LoginModal';
import DashboardPage from './pages/DashboardPage';
import Servers from './pages/Servers';
import Wallet from './pages/Wallet';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import DashboardLayout from './components/DashboardLayout';

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <LoginModal />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/servers" element={<RequireAuth><Servers /></RequireAuth>} />
      <Route path="/wallet" element={<RequireAuth><Wallet /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
