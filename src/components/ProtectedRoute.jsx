import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import DashboardLayout from './DashboardLayout';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/dashboard" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
}
