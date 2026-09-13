import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useCourseData } from '../context/CourseDataContext';
import { Card, Button } from '../components/ui';
import AdminPageHeader from './components/AdminPageHeader';
import { resetToSeedData } from '../services/api';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const { refresh } = useCourseData();
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!window.confirm('Reset ALL course content back to the original default sample data? This cannot be undone.')) return;
    setResetting(true);
    try {
      await resetToSeedData();
      await refresh();
      showToast('Course data reset to defaults', 'success');
    } catch {
      showToast('Unable to reset — try again', 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <AdminPageHeader title="Settings" subtitle="Site-wide settings and maintenance actions." />

      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-navy-900 mb-2">Course Title, Instructor Info & Footer Text</h3>
        <p className="text-sm text-slate-500 mb-4">
          The course title, subtitle, description, objectives, instructor details and footer text are edited from the Course Details page.
        </p>
        <Link to="/admin/course">
          <Button variant="outline">Go to Course Details</Button>
        </Link>
      </Card>

      <Card className="p-6 border-safety-red/30">
        <h3 className="font-semibold text-safety-red mb-2 flex items-center gap-2">
          <AlertTriangle size={17} /> Danger Zone
        </h3>
        <p className="text-sm text-slate-500 mb-4">Reset all course content (days, topics, activities, quizzes, resources) back to the original sample data this site shipped with.</p>
        <Button variant="danger" onClick={handleReset} disabled={resetting}>
          {resetting ? 'Resetting…' : 'Reset to Default Sample Data'}
        </Button>
      </Card>
    </div>
  );
}
