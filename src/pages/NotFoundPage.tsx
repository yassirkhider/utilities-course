import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-brand-200 mb-2">404</p>
      <h1 className="text-2xl font-bold text-navy-900 mb-2">Page not found</h1>
      <p className="text-slate-500 mb-6">The page you're looking for doesn't exist or may have been moved.</p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
