// frontend/src/features/tasks/pages/TaskDetail.jsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTask, useUpdateTaskStatus, useUpdateProgress, useAddSubtask, useDeleteSubtask } from '../../features/tasks/hooks/task.query.js';
import Badge from '../../components/ui/Badge.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { Edit2, Plus, X } from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const [newSubtask, setNewSubtask] = useState('');

  const { data, isLoading, error, refetch } = useTask(id);
  const task = data?.data?.data;

  const updateStatus = useUpdateTaskStatus();
  const updateProgress = useUpdateProgress();
  const addSubtask = useAddSubtask();
  const deleteSubtask = useDeleteSubtask();

  const statuses = [
    { value: 'pending', label: 'Bekliyor' },
    { value: 'in_progress', label: 'Devam Ediyor' },
    { value: 'completed', label: 'Tamamlandı' },
    { value: 'cancelled', label: 'İptal' },
  ];

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

  const getPriorityLabel = (priority) => {
    const labels = {
      low: 'Düşük',
      normal: 'Normal',
      high: 'Yüksek',
      critical: 'Kritik',
    };
    return labels[priority] || 'Normal';
  };

  const isOverdue = task?.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed' && task.status !== 'cancelled';

  const handleStatusChange = (e) => {
    updateStatus.mutate({ id: task.id, status: e.target.value });
  };

  const handleProgressChange = (e) => {
    updateProgress.mutate({ id: task.id, progress: parseInt(e.target.value) });
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      addSubtask.mutate({
        id: task.id,
        data: { title: newSubtask.trim() }
      }, {
        onSuccess: () => setNewSubtask('')
      });
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/tasks" className="text-blue-600 hover:underline">
            ← Görevler
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {task.title}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant={getStatusVariant(task.status)}>
              {statuses.find(s => s.value === task.status)?.label || task.status}
            </Badge>
            <Badge variant={getPriorityVariant(task.priority)}>
              {getPriorityLabel(task.priority)}
            </Badge>
            {isOverdue && (
              <Badge variant="danger">⚠️ Gecikti</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={task.status}
            onChange={handleStatusChange}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={updateStatus.isPending}
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <Link to={`/tasks/${task.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Edit2 className="w-4 h-4" />
              Düzenle
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sol Kart - Bilgiler */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">📋 Bilgiler</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            {task.description && (
              <div>
                <p className="text-sm text-gray-500">Açıklama</p>
                <p className="text-gray-900 dark:text-white">{task.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Atanan Kişi</p>
              <p className="text-gray-900 dark:text-white">
                {task.assignee?.first_name} {task.assignee?.last_name || 'Atanmadı'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Oluşturan</p>
              <p className="text-gray-900 dark:text-white">
                {task.creator?.first_name} {task.creator?.last_name || 'Bilinmiyor'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Son Tarih</p>
              <p className={`text-gray-900 dark:text-white ${isOverdue ? 'text-red-600' : ''}`}>
                {task.due_date ? new Date(task.due_date).toLocaleString('tr-TR') : 'Belirtilmemiş'}
                {isOverdue && ' ⚠️ Gecikti'}
              </p>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">İlerleme</p>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {task.progress || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress || 0}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={task.progress || 0}
                onChange={handleProgressChange}
                disabled={updateProgress.isPending}
                className="w-full mt-2 accent-blue-600 cursor-pointer"
              />
              {updateProgress.isPending && (
                <span className="text-xs text-gray-500">Güncelleniyor...</span>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Sağ Kart - İlişkili */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">🔗 İlişkili</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            {task.case && (
              <div>
                <p className="text-sm text-gray-500">Dava</p>
                <Link to={`/cases/${task.case.id}`} className="text-blue-600 hover:underline">
                  {task.case.title}
                </Link>
              </div>
            )}
            {task.client && (
              <div>
                <p className="text-sm text-gray-500">Müvekkil</p>
                <Link to={`/clients/${task.client.id}`} className="text-blue-600 hover:underline">
                  {task.client.name}
                </Link>
              </div>
            )}
            {task.tags && task.tags.length > 0 && (
              <div>
                <p className="text-sm text-gray-500">Etiketler</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="default">#{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Subtask'lar */}
            <div>
              <p className="text-sm text-gray-500">Alt Görevler</p>
              {task.subtasks && task.subtasks.length > 0 ? (
                <div className="space-y-1 mt-1">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant={getStatusVariant(subtask.status)}>
                          {statuses.find(s => s.value === subtask.status)?.label || subtask.status}
                        </Badge>
                        <Link to={`/tasks/${subtask.id}`} className="text-blue-600 hover:underline">
                          {subtask.title}
                        </Link>
                        {subtask.due_date && (
                          <span className="text-xs text-gray-400">
                            {new Date(subtask.due_date).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteSubtask.mutate({ id: task.id, subtaskId: subtask.id })}
                        disabled={deleteSubtask.isPending}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-1">Alt görev bulunmuyor</p>
              )}

              {/* Yeni Subtask Ekle */}
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Yeni alt görev..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddSubtask}
                  disabled={!newSubtask.trim() || addSubtask.isPending}
                  className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Ekle
                </button>
              </div>
              {addSubtask.isPending && (
                <span className="text-xs text-gray-500">Ekleniyor...</span>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default TaskDetail;