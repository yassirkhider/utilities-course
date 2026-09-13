import { useRef, useState } from 'react';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { useToast } from '../context/ToastContext';
import { Card, Button } from '../components/ui';
import AdminPageHeader from './components/AdminPageHeader';
import { exportBackup, importBackup } from '../services/api';
import type { CourseData } from '../types';

export default function AdminBackupPage() {
  const { refresh } = useCourseData();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    try {
      const data = await exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'course-backup.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup downloaded', 'success');
    } catch {
      showToast('Unable to export — try again', 'error');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm('Importing will overwrite ALL existing course content, topics, activities, quizzes and resource metadata. Continue?')) {
      e.target.value = '';
      return;
    }
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as CourseData;
      await importBackup(data);
      await refresh();
      showToast('Course data imported successfully', 'success');
    } catch {
      showToast('Unable to save — try again. Check the backup file is valid JSON exported from this system.', 'error');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <AdminPageHeader title="Backup & Restore" subtitle="Export a full snapshot of your course data, or restore from a previous backup." />

      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-navy-900 mb-2 flex items-center gap-2">
          <Download size={17} /> Export Course Data
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Downloads <code className="bg-slate-100 px-1 rounded">course-backup.json</code> containing the course details, days, topics, activities, quizzes and
          resource metadata (uploaded file binaries are stored separately in Netlify Blobs and are not included in this JSON export).
        </p>
        <Button onClick={handleExport}>
          <Download size={15} /> Export Course Data
        </Button>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-navy-900 mb-2 flex items-center gap-2">
          <Upload size={17} /> Import Course Data
        </h3>
        <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 mb-4">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p>Importing overwrites all existing course content. You will be asked to confirm before anything is changed.</p>
        </div>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} disabled={importing} className="text-sm" />
      </Card>
    </div>
  );
}
