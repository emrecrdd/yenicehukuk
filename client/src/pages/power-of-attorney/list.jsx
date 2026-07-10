import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { powerOfAttorneyApi } from '../../features/power-of-attorney/powerOfAttorney.api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';

const PowerOfAttorneyList = () => {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['powerOfAttorneys', { page, search: searchQuery, status: statusFilter }],
    queryFn: () => powerOfAttorneyApi.getAll({ page, search: searchQuery, status: statusFilter }),
    staleTime: 1000,
    keepPreviousData: true,
  });

  // ✅ DOĞRU - data?.data?.data (3 katman)
  const powerOfAttorneys = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  console.log('📜 powerOfAttorneys:', powerOfAttorneys);
  console.log('📜 Array mi?', Array.isArray(powerOfAttorneys));

  const handleSearch = () => {
    setSearchQuery(search);
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const statuses = [
    { value: '', label: 'Tümü' },
    { value: 'active', label: 'Aktif' },
    { value: 'expired', label: 'Süresi Doldu' },
    { value: 'cancelled', label: 'İptal' },
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Aktif',
      expired: 'Süresi Doldu',
      cancelled: 'İptal',
    };
    return labels[status] || status;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR');
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
        <h2 className="text-xl font-bold text-red-600">Vekaletnameler yüklenirken hata oluştu</h2>
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
          📜 Vekaletnameler
        </h1>
        <Link to="/power-of-attorney/create">
          <Button>+ Yeni Vekaletname</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Vekaletname ara... (Enter ile ara)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                icon="🔍"
              />
              <Button variant="primary" onClick={handleSearch} className="shrink-0">
                Ara
              </Button>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
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
                <Table.HeadCell>Müvekkil</Table.HeadCell>
                <Table.HeadCell>Başlık</Table.HeadCell>
                <Table.HeadCell>Dava</Table.HeadCell>
                <Table.HeadCell>Başlangıç</Table.HeadCell>
                <Table.HeadCell>Bitiş</Table.HeadCell>
                <Table.HeadCell>Durum</Table.HeadCell>
                <Table.HeadCell>İşlem</Table.HeadCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {powerOfAttorneys.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan="7" className="text-center py-8 text-gray-500">
                    {searchQuery ? 'Aramanıza uygun vekaletname bulunamadı' : 'Henüz vekaletname bulunmuyor'}
                  </Table.Cell>
                </Table.Row>
              ) : (
                powerOfAttorneys.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell>
                      <Link to={`/clients/${item.client_id}`} className="text-blue-600 hover:underline">
                        {item.client?.name || '-'}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {item.description}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {item.case ? (
                        <Link to={`/cases/${item.case.id}`} className="text-blue-600 hover:underline">
                          {item.case.title}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </Table.Cell>
                    <Table.Cell>{formatDate(item.start_date)}</Table.Cell>
                    <Table.Cell>{formatDate(item.end_date) || '-'}</Table.Cell>
                    <Table.Cell>
                      <Badge variant={getStatusVariant(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Link
                        to={`/power-of-attorney/${item.id}`}
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
              Toplam {pagination.total} vekaletname
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

export default PowerOfAttorneyList;