import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UploadCloud, Link2, Trash2, Save, RefreshCw } from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { useToast } from '../context/ToastContext';
import { LoadingState, ErrorState, EmptyState, Card, Button, Badge } from '../components/ui';
import AdminPageHeader from './components/AdminPageHeader';
import SortableList, { DragHandle } from './components/SortableList';
import { createResource, deleteResource, replaceResource, reorderResources, updateResource, uploadResource } from '../services/api';
import { RESOURCE_TYPE_BADGE_CLASS, RESOURCE_TYPE_LABEL } from '../utils/badges';
import { formatBytes } from '../utils/format';
import type { Resource, ResourceType } from '../types';

const RESOURCE_TYPES: ResourceType[] = ['handout', 'pid', 'activity', 'presentation', 'schedule', 'video', 'document', 'worksheet', 'quiz-support'];

export default function AdminResourcesPage() {
  const { type } = useParams<{ type?: string }>();
  const { data, loading, error, refresh } = useCourseData();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replacingId = useRef<string | null>(null);

  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<ResourceType>((type as ResourceType) || 'handout');
  const [uploadDay, setUploadDay] = useState('');
  const [uploadTopic, setUploadTopic] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [externalMode, setExternalMode] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Resource>>({});

  if (loading) return <LoadingState label="Loading resources…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;

  const filtered = data.resources.filter((r) => !type || r.resourceType === type).sort((a, b) => a.order - b.order);

  const resetUploadForm = () => {
    setUploadTitle('');
    setUploadDescription('');
    setUploadDay('');
    setUploadTopic('');
    setExternalUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!uploadTitle.trim()) {
      showToast('Resource title is required', 'error');
      return;
    }
    try {
      if (externalMode) {
        if (!externalUrl.trim()) {
          showToast('External URL is required', 'error');
          return;
        }
        await createResource({
          title: uploadTitle,
          description: uploadDescription,
          resourceType: uploadType,
          dayId: uploadDay || null,
          topicId: uploadTopic || null,
          externalUrl,
        });
      } else {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
          showToast('Please choose a file to upload', 'error');
          return;
        }
        setUploadProgress(0);
        await uploadResource(
          file,
          { title: uploadTitle, description: uploadDescription, resourceType: uploadType, dayId: uploadDay || undefined, topicId: uploadTopic || undefined },
          setUploadProgress
        );
      }
      await refresh();
      resetUploadForm();
      showToast('Upload complete', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to save — try again', 'error');
    } finally {
      setUploadProgress(null);
    }
  };

  const handleReplaceFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const id = replacingId.current;
    if (!file || !id) return;
    try {
      await replaceResource(id, file);
      await refresh();
      showToast('Upload complete', 'success');
    } catch {
      showToast('Unable to save — try again', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const startEdit = (r: Resource) => {
    setEditingId(r.id);
    setEditForm({ title: r.title, description: r.description, dayId: r.dayId, topicId: r.topicId });
  };

  const saveEdit = async (id: string) => {
    try {
      await updateResource(id, editForm);
      await refresh();
      setEditingId(null);
      showToast('Changes saved successfully', 'success');
    } catch {
      showToast('Unable to save — try again', 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete resource "${title}"? This will remove the uploaded file.`)) return;
    try {
      await deleteResource(id);
      await refresh();
      showToast('Resource deleted', 'success');
    } catch {
      showToast('Unable to save — try again', 'error');
    }
  };

  const handleReorder = async (newList: Resource[]) => {
    try {
      await reorderResources(newList.map((r) => r.id));
      await refresh();
    } catch {
      showToast('Unable to save order — try again', 'error');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <AdminPageHeader
        title={type ? `${RESOURCE_TYPE_LABEL[type as ResourceType]} Resources` : 'Resources'}
        subtitle="Upload, rename, replace, reassign, reorder or delete course files."
      />

      <Card className="p-5 mb-6">
        <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
          <UploadCloud size={17} /> Upload New Resource
        </h3>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <input placeholder="Resource title" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <select value={uploadType} onChange={(e) => setUploadType(e.target.value as ResourceType)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{RESOURCE_TYPE_LABEL[t]}</option>)}
          </select>
          <select value={uploadDay} onChange={(e) => setUploadDay(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">No day assigned</option>
            {data.days.map((d) => <option key={d.id} value={d.id}>Day {d.dayNumber}</option>)}
          </select>
          <select value={uploadTopic} onChange={(e) => setUploadTopic(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">No topic assigned</option>
            {data.topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          <input
            placeholder="Description (optional)"
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <label className="inline-flex items-center gap-1.5 text-sm">
            <input type="radio" checked={!externalMode} onChange={() => setExternalMode(false)} /> Upload file
          </label>
          <label className="inline-flex items-center gap-1.5 text-sm">
            <input type="radio" checked={externalMode} onChange={() => setExternalMode(true)} /> External URL
          </label>
        </div>

        {externalMode ? (
          <div className="flex items-center gap-2 mb-3">
            <Link2 size={16} className="text-slate-400" />
            <input
              placeholder="https://…"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        ) : (
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.pptx,.docx,.xlsx,.png,.jpg,.jpeg,.webp,.mp4"
            className="mb-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-brand-700"
          />
        )}

        {uploadProgress !== null && (
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
            <div className="h-full bg-brand-500 transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}

        <Button onClick={handleUpload} disabled={uploadProgress !== null}>
          {uploadProgress !== null ? `Uploading… ${uploadProgress}%` : 'Upload'}
        </Button>
        <p className="text-xs text-slate-400 mt-2">Allowed: PDF, PPTX, DOCX, XLSX, PNG, JPG, WEBP, MP4. Max 100 MB.</p>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState label="No resources yet" hint="Upload a file above to get started." />
      ) : (
        <SortableList
          items={filtered}
          onReorder={handleReorder}
          className="space-y-2"
          renderItem={(r, handle) => (
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <DragHandle {...handle.attributes} {...handle.listeners} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <Badge className={RESOURCE_TYPE_BADGE_CLASS[r.resourceType]}>{RESOURCE_TYPE_LABEL[r.resourceType]}</Badge>
                    {r.dayId && <Badge className="bg-slate-100 text-slate-600 border-slate-200">Day {data.days.find((d) => d.id === r.dayId)?.dayNumber}</Badge>}
                    {!r.blobKey && !r.externalUrl && <Badge className="bg-amber-100 text-amber-700 border-amber-200">Not uploaded</Badge>}
                  </div>
                  <p className="font-medium text-navy-900 truncate">{r.title}</p>
                  <p className="text-xs text-slate-500">{r.blobKey ? formatBytes(r.size) : r.externalUrl ? 'External link' : 'No file'}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {r.blobKey && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        replacingId.current = r.id;
                        replaceInputRef.current?.click();
                      }}
                      aria-label="Replace file"
                    >
                      <RefreshCw size={15} />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => startEdit(r)} aria-label="Edit">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id, r.title)} aria-label="Delete" className="hover:!text-safety-red">
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>

              {editingId === r.id && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid sm:grid-cols-2 gap-3">
                  <input
                    value={editForm.title ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Title"
                  />
                  <input
                    value={editForm.description ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Description"
                  />
                  <select
                    value={editForm.dayId ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, dayId: e.target.value || null })}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">No day</option>
                    {data.days.map((d) => <option key={d.id} value={d.id}>Day {d.dayNumber}</option>)}
                  </select>
                  <select
                    value={editForm.topicId ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, topicId: e.target.value || null })}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">No topic</option>
                    {data.topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                  <div className="sm:col-span-2 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                    <Button size="sm" onClick={() => saveEdit(r.id)}>
                      <Save size={14} /> Save
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        />
      )}

      <input ref={replaceInputRef} type="file" className="hidden" onChange={handleReplaceFileChosen} />
    </div>
  );
}
