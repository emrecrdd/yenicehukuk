import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import taskApi from '../../features/tasks/task.api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';

const TasksList = () => {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // ✅ Arama için ayrı state
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);

  // ✅ searchQuery ile query çalışır (sadece butona tıklayınca veya Enter'a basınca değişir)
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', { page, search: searchQuery, status: statusFilter, priority: priorityFilter }],
    queryFn: () => taskApi.getAll({ page, search: searchQuery, status: statusFilter, priority: priorityFilter }),
    staleTime: 1000,
    keepPreviousData: true,
  });

  const tasks = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  // ✅ Arama yap
  const handleSearch = () => {
    setSearchQuery(search);
    setPage(1);
  };

  // ✅ Enter tuşuna basınca arama yap
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // ✅ Filtre değişince
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handlePriorityChange = (e) => {
    setPriorityFilter(e.target.value);
    setPage(1);
  };

  const statuses = [
    { value: '', label: 'Tümü' },
    { value: 'pending', label: 'Bekliyor' },
    { value: 'in_progress', label: 'Devam Ediyor' },
    { value: 'completed', label: 'Tamamlandı' },
    { value: 'cancelled', label: 'İptal' },
  ];

  const priorities = [
    { value: '', label: 'Tümü' },
    { value: 'low', label: 'Düşük' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Yüksek' },
    { value: 'critical', label: 'Kritik' },
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
    return priorities.find(p => p.value === priority)?.label || priority;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-red-600">Görevler yüklenirken hata oluştu</h2>
        <p className="text-gray-500">{error.message}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Yeniden Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ✅ Görevler
        </h1>
        <Link to="/tasks/create">
          <Button>+ Yeni Görev</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Görev ara... (Enter ile ara)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                icon="🔍"
              />
              <Button 
                variant="primary" 
                onClick={handleSearch}
                className="shrink-0"
              >
                Ara
              </Button>
            </div>
            <div className="sm:w-40">
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:w-40">
              <select
                value={priorityFilter}
                onChange={handlePriorityChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeadCell>Görev</Table.HeadCell>
                <Table.HeadCell>Atanan</Table.HeadCell>
                <Table.HeadCell>Dava</Table.HeadCell>
                <Table.HeadCell>Öncelik</Table.HeadCell>
                <Table.HeadCell>Durum</Table.HeadCell>
                <Table.HeadCell>Son Tarih</Table.HeadCell>
                <Table.HeadCell>İşlem</Table.HeadCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {tasks.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan="7" className="text-center py-8 text-gray-500">
                    {searchQuery ? 'Aramanıza uygun görev bulunamadı' : 'Henüz görev bulunmuyor'}
                  </Table.Cell>
                </Table.Row>
              ) : (
                tasks.map((task) => (
                  <Table.Row key={task.id}>
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
                      {task.case?.title || '-'}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={getPriorityVariant(task.priority)}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={getStatusVariant(task.status)}>
                        {statuses.find(s => s.value === task.status)?.label || task.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('tr-TR') : '-'}
                    </Table.Cell>
                    <Table.Cell>
                      <Link
                        to={`/tasks/${task.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Görüntüle
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toplam {pagination.total} görev
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Önceki
              </Button>
              <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
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