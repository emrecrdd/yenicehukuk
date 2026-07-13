// 📁 client/src/features/tasks/pages/TaskList.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasks, useCompleteTask } from '../task.query.js';
import { useAuth } from '../../../app/providers/auth.provider.jsx';
import { useDebounce } from '../../../hooks/useDebounce.js';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import Table from '../../../components/ui/Table.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import { CheckCircle } from 'lucide-react';

const TasksList = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 500);
  const completeTask = useCompleteTask();

  const { data, isLoading } = useTasks({
    page,
    search: debouncedSearch,
    status: statusFilter,
    priority: priorityFilter,
  });

  const tasks = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const isAdmin = user?.role === 'admin';

  const getStatusBadge = (status) => {
    const map = {
      draft: { label: '📄 Taslak', variant: 'default' },
      pending: { label: '⏳ Bekliyor', variant: 'warning' },
      accepted: { label: '✅ Kabul Edildi', variant: 'success' },
      rejected: { label: '❌ Reddedildi', variant: 'danger' },
      in_progress: { label: '⚡ Devam Ediyor', variant: 'info' },
      review: { label: '🔍 İncelemede', variant: 'info' },
      completed: { label: '🎉 Tamamlandı', variant: 'success' },
      cancelled: { label: '⛔ İptal', variant: 'danger' },
      archived: { label: '📦 Arşivlendi', variant: 'default' },
    };
    return map[status] || { label: status, variant: 'default' };
  };

  const isOverdue = (task) => {
    if (!task.due_date) return false;
    if (task.status === 'completed' || task.status === 'cancelled' || task.status === 'archived')
      return false;
    return new Date(task.due_date) < new Date();
  };

  const handleComplete = (taskId) => {
    if (window.confirm('Görevi tamamladığınıza emin misiniz?')) {
      completeTask.mutate(taskId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">📋 Görevler</h1>
        {isAdmin && (
          <Link to="/tasks/create">
            <Button>+ Yeni Görev</Button>
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Görev ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon="🔍"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border px-3 py-2"
            >
              <option value="">Tüm Durumlar</option>
              <option value="pending">Bekliyor</option>
              <option value="accepted">Kabul Edildi</option>
              <option value="rejected">Reddedildi</option>
              <option value="in_progress">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-md border px-3 py-2"
            >
              <option value="">Tüm Öncelikler</option>
              <option value="critical">Kritik</option>
              <option value="high">Yüksek</option>
              <option value="medium">Orta</option>
              <option value="low">Düşük</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeadCell>Görev</Table.HeadCell>
                <Table.HeadCell>Atanan</Table.HeadCell>
                <Table.HeadCell>Öncelik</Table.HeadCell>
                <Table.HeadCell>Durum</Table.HeadCell>
                <Table.HeadCell>Son Tarih</Table.HeadCell>
                <Table.HeadCell>İlerleme</Table.HeadCell>
                <Table.HeadCell>İşlem</Table.HeadCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {tasks.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan="7" className="text-center py-8 text-gray-500">
                    {search ? 'Aramanıza uygun görev bulunamadı' : 'Henüz görev bulunmuyor'}
                  </Table.Cell>
                </Table.Row>
              ) : (
                tasks.map((task) => {
                  const statusBadge = getStatusBadge(task.status);
                  const overdue = isOverdue(task);
                  const canComplete =
                    task.assigned_to === user?.id &&
                    ['accepted', 'in_progress'].includes(task.status);

                  return (
                    <Table.Row
                      key={task.id}
                      className={overdue ? 'bg-red-50 dark:bg-red-900/10' : ''}
                    >
                      <Table.Cell>
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {task.description}
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {task.assignee?.first_name} {task.assignee?.last_name || 'Atanmadı'}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          variant={
                            task.priority === 'critical'
                              ? 'danger'
                              : task.priority === 'high'
                                ? 'warning'
                                : 'default'
                          }
                        >
                          {task.priority}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </Table.Cell>
                      <Table.Cell className={overdue ? 'text-red-600 font-medium' : ''}>
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString('tr-TR')
                          : '-'}
                        {overdue && ' ⚠️'}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${task.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs">{task.progress || 0}%</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/tasks/${task.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            Görüntüle
                          </Link>
                          {canComplete && (
                            <button
                              onClick={() => handleComplete(task.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Tamamla"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              )}
            </Table.Body>
          </Table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">Toplam {pagination.total} görev</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Önceki
              </Button>
              <span className="px-3 py-1 text-sm">
                {page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Sonraki
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksList;