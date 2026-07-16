import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useTask,
  useStartTask,
  useCompleteTask,
  useApproveTask,
  useAddNote,
  useTaskNotes,
  useUpdateProgress,
} from '../../features/tasks/task.query.js';
import { useAuth } from '../../app/providers/auth.provider.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { Edit2, Play, CheckCircle, ShieldCheck, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

// ======================================================
// SABİTLER
// ======================================================

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Bekliyor' },
  { value: 'in_progress', label: 'Devam Ediyor' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'cancelled', label: 'İptal' },
];

const PRIORITY_LABELS = {
  low: 'Düşük',
  normal: 'Normal',
  high: 'Yüksek',
  critical: 'Kritik',
};

const getStatusVariant = (status) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'in_progress': return 'info';
    case 'completed': return 'success';
    case 'cancelled': return 'danger';
    default: return 'default';
  }
};

const getPriorityVariant = (priority) => {
  switch (priority) {
    case 'critical': return 'danger';
    case 'high': return 'warning';
    case 'normal': return 'default';
    case 'low': return 'default';
    default: return 'default';
  }
};

const getPriorityLabel = (priority) => PRIORITY_LABELS[priority] || 'Normal';

// ======================================================
// UTC format fonksiyonu (zaman dilimi çevirme YOK)
// ======================================================

const formatDateUTC = (date) => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    return `${String(d.getUTCDate()).padStart(2, '0')}.${String(
      d.getUTCMonth() + 1
    ).padStart(2, '0')}.${d.getUTCFullYear()} ${String(
      d.getUTCHours()
    ).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  } catch {
    return '-';
  }
};

// ======================================================
// COMPONENT
// ======================================================

const TaskDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [noteContent, setNoteContent] = useState('');
  const [completionNote, setCompletionNote] = useState('');
  const [actualHours, setActualHours] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  // ✅ HOOK'lar
  const { data, isLoading, error } = useTask(id);
  const { data: notesData } = useTaskNotes(id);

  const startMutation = useStartTask();
  const completeMutation = useCompleteTask();
  const approveMutation = useApproveTask();
  const addNoteMutation = useAddNote();
  const updateProgressMutation = useUpdateProgress();

  const task = data?.data?.data;
  const notes = notesData?.data?.data || [];

  const isAssignee = task?.assigned_to === user?.id;
  const isAdmin = user?.role === 'admin';
  const canStart = isAssignee && task?.status === 'pending';
  const canComplete = isAssignee && task?.status === 'in_progress';
  const canApprove = isAdmin && task?.status === 'completed' && !task?.approved_at;
  const canUpdateProgress = isAssignee && task?.status === 'in_progress';

  const isOverdue =
    task?.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== 'completed' &&
    task.status !== 'cancelled';

  // ✅ Mevcut progress'i state'e ata
  useEffect(() => {
    if (task) {
      setProgressValue(task.progress || 0);
    }
  }, [task]);

  // ======================================================
  // HANDLERS
  // ======================================================

  const handleUpdateProgress = () => {
    if (progressValue < 0 || progressValue > 100) {
      toast.error('İlerleme 0-100 arasında olmalı');
      return;
    }
    updateProgressMutation.mutate({ id, progress: progressValue });
  };

  const handleProgressChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setProgressValue(Math.min(100, Math.max(0, value)));
  };

  const handleStart = () => {
    if (window.confirm(`"${task?.title}" görevini başlatmak istediğinize emin misiniz?`)) {
      startMutation.mutate(id);
    }
  };

  const handleComplete = () => {
    if (!completionNote.trim()) {
      toast.error('Tamamlama notu girmelisiniz!');
      return;
    }

    completeMutation.mutate(
      {
        id,
        note: completionNote,
        actual_hours: actualHours ? parseFloat(actualHours) : undefined,
      },
      {
        onSuccess: () => {
          setShowCompleteModal(false);
          setCompletionNote('');
          setActualHours('');
        },
      }
    );
  };

  const handleApprove = () => {
    if (window.confirm(`"${task?.title}" görevini onaylamak istediğinize emin misiniz?`)) {
      approveMutation.mutate(id);
    }
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) {
      toast.error('Not içeriği boş olamaz');
      return;
    }

    addNoteMutation.mutate(
      { id, content: noteContent },
      {
        onSuccess: () => {
          setNoteContent('');
        },
      }
    );
  };

  // ======================================================
  // LOADING / ERROR
  // ======================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Görev bulunamadı</p>
        <Link to="/tasks" className="text-blue-600 hover:underline">
          ← Görevlere Dön
        </Link>
      </div>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link to="/tasks" className="text-blue-600 hover:underline">
            ← Görevler
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {task.title}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant={getStatusVariant(task.status)}>
              {STATUS_OPTIONS.find((s) => s.value === task.status)?.label || task.status}
            </Badge>
            <Badge variant={getPriorityVariant(task.priority)}>
              {getPriorityLabel(task.priority)}
            </Badge>
            {isOverdue && <Badge variant="danger">⚠️ Gecikti</Badge>}
            {task.approved_at && <Badge variant="success">✅ Onaylandı</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canStart && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleStart}
              loading={startMutation.isPending}
              className="flex items-center gap-1"
            >
              <Play className="w-4 h-4" />
              Başlat
            </Button>
          )}

          {canComplete && (
            <Button
              variant="success"
              size="sm"
              onClick={() => setShowCompleteModal(true)}
              loading={completeMutation.isPending}
              className="flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Tamamla
            </Button>
          )}

          {canApprove && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
              loading={approveMutation.isPending}
              className="flex items-center gap-1"
            >
              <ShieldCheck className="w-4 h-4" />
              Onayla
            </Button>
          )}

          <Link to={`/tasks/${task.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Edit2 className="w-4 h-4" />
              Düzenle
            </Button>
          </Link>
        </div>
      </div>

      {/* BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BİLGİLER */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">📋 Bilgiler</h2>
          </Card.Header>
          <Card.Body className="space-y-3">
            {task.description && (
              <div>
                <p className="text-sm text-gray-500">Açıklama</p>
                <p className="text-gray-900 dark:text-white">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">👤 Atanan Kişi</p>
                <p className="text-gray-900 dark:text-white">
                  {task.assignee?.first_name} {task.assignee?.last_name || 'Atanmadı'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">👤 Oluşturan</p>
                <p className="text-gray-900 dark:text-white">
                  {task.creator?.first_name} {task.creator?.last_name || 'Bilinmiyor'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">📅 Son Tarih</p>
                <p className={`text-gray-900 dark:text-white ${isOverdue ? 'text-red-600' : ''}`}>
                  {task.due_date ? formatDateUTC(task.due_date) : 'Belirtilmemiş'}
                  {isOverdue && ' ⚠️ Gecikti'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">⏱️ Tahmini Süre</p>
                <p className="text-gray-900 dark:text-white">
                  {task.estimated_hours ? `${task.estimated_hours} saat` : 'Belirtilmemiş'}
                </p>
              </div>
            </div>

            {(task.started_at || task.completed_at || task.actual_hours) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ⏱️ Süre Takibi
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {task.started_at && (
                    <div>
                      <p className="text-sm text-gray-500">Başlangıç</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDateUTC(task.started_at)}
                      </p>
                    </div>
                  )}
                  {task.completed_at && (
                    <div>
                      <p className="text-sm text-gray-500">Bitiş</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDateUTC(task.completed_at)}
                      </p>
                    </div>
                  )}
                  {task.actual_hours && (
                    <div>
                      <p className="text-sm text-gray-500">Gerçek Süre</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {task.actual_hours} saat
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PROGRESS */}
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">📊 İlerleme</p>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {task.progress || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress || 0}%` }}
                />
              </div>

              {canUpdateProgress && (
                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressValue}
                    onChange={handleProgressChange}
                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <input
                    type="number"
                    value={progressValue}
                    onChange={handleProgressChange}
                    min="0"
                    max="100"
                    className="w-16 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    size="sm"
                    onClick={handleUpdateProgress}
                    loading={updateProgressMutation.isPending}
                    disabled={updateProgressMutation.isPending}
                  >
                    Güncelle
                  </Button>
                </div>
              )}
            </div>

            {(task.case || task.client) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🔗 İlişkili
                </p>
                <div className="space-y-1">
                  {task.case && (
                    <div>
                      <span className="text-sm text-gray-500">Dava: </span>
                      <Link to={`/cases/${task.case.id}`} className="text-blue-600 hover:underline">
                        {task.case.title}
                      </Link>
                    </div>
                  )}
                  {task.client && (
                    <div>
                      <span className="text-sm text-gray-500">Müvekkil: </span>
                      <Link to={`/clients/${task.client.id}`} className="text-blue-600 hover:underline">
                        {task.client.name}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* NOTLAR */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">📝 Notlar</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            {isAssignee && (
              <div className="space-y-2">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Not ekle..."
                  rows="2"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  loading={addNoteMutation.isPending}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Not Ekle
                </Button>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">Henüz not yok</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>
                        {note.creator?.first_name} {note.creator?.last_name}
                      </span>
                      <span>•</span>
                      <span>
                        {formatDateUTC(note.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* TAMAMLAMA MODALI */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Görevi Tamamla
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              "{task.title}" görevini tamamlıyorsun. Lütfen bir tamamlama notu girin.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tamamlama Notu *
                </label>
                <textarea
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  placeholder="Görev nasıl tamamlandı? Ne yapıldı?"
                  rows="4"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gerçek Süre (Saat) - isteğe bağlı
                </label>
                <input
                  type="number"
                  value={actualHours}
                  onChange={(e) => setActualHours(e.target.value)}
                  placeholder="Örn: 3.5"
                  min="0"
                  step="0.5"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="success"
                onClick={handleComplete}
                loading={completeMutation.isPending}
                className="flex-1"
              >
                Tamamla
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCompleteModal(false);
                  setCompletionNote('');
                  setActualHours('');
                }}
                className="flex-1"
              >
                İptal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;