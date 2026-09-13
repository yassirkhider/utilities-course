import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from '../components/ui';

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { authenticated, checking } = useAuth();
  const location = useLocation();

  if (checking) return <LoadingState label="Checking session…" />;
  if (!authenticated) return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}
