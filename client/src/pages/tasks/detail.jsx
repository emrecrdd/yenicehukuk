import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import taskApi from '../../features/tasks/task.api.js';
import Badge from '../../components/ui/Badge.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TaskDetail = () => {
  const { id } = useParams();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['task', id],
    queryFn: () => taskApi.getOne(id),
  });

  const updateStatus = useMutation({
    mutationFn: ({ status }) => taskApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Görev durumu güncellendi');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Durum güncellenemedi');
    },
  });

  const task = data?.data?.data;

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
      <div className="flex items-center justify-between">
        <div>
          <Link to="/tasks" className="text-blue-600 hover:underline">
            ← Görevler
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {task.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
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
        {/* ✅ BUTONLAR AYNI HİZADA - flex items-center gap-2 */}
        <div className="flex items-center gap-2">
          <select
            value={task.status}
            onChange={(e) => updateStatus.mutate({ status: e.target.value })}
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
        {/* Bilgi Kartı */}
        <Card>
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
            <div>
              <p className="text-sm text-gray-500">İlerleme</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${task.progress || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{task.progress || 0}% tamamlandı</p>
            </div>
          </Card.Body>
        </Card>

        {/* İlişkili Kartı */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">🔗 İlişkili</h2>
          </Card.Header>
          <Card.Body className="space-y-3">
            {task.case && (
              <div>
                <p className="text-sm text-gray-500">Dava</p>
                <Link
                  to={`/cases/${task.case.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {task.case.title}
                </Link>
              </div>
            )}
            {task.client && (
              <div>
                <p className="text-sm text-gray-500">Müvekkil</p>
                <Link
                  to={`/clients/${task.client.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {task.client.first_name} {task.client.last_name}
                </Link>
              </div>
            )}
            {task.tags && task.tags.length > 0 && (
              <div>
                <p className="text-sm text-gray-500">Etiketler</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="default">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <div>
                <p className="text-sm text-gray-500">Alt Görevler</p>
                <div className="space-y-1 mt-1">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 text-sm">
                      <Badge variant={getStatusVariant(subtask.status)}>
                        {statuses.find(s => s.value === subtask.status)?.label || subtask.status}
                      </Badge>
                      <Link
                        to={`/tasks/${subtask.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {subtask.title}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default TaskDetail;