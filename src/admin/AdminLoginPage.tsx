import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';

export default function AdminLoginPage() {
  const { authenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (authenticated) {
    const from = (location.state as { from?: string } | null)?.from || '/admin';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await login(password);
    setSubmitting(false);
    if (result.ok) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.message || 'Incorrect password');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-teal-accent-400 mb-3">
            <ShieldCheck size={26} />
          </span>
          <h1 className="text-xl font-bold text-navy-900">Instructor / Admin Login</h1>
          <p className="text-sm text-slate-500">Sign in to manage course content.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="admin-password"
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          {error && <p className="text-sm text-safety-red" role="alert">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
