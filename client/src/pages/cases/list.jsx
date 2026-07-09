import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import caseApi from '../../features/cases/case.api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';

const CasesList = () => {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // ✅ Arama için ayrı state
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // ✅ searchQuery ile query çalışır (sadece butona tıklayınca veya Enter'a basınca değişir)
  const { data, isLoading, error } = useQuery({
    queryKey: ['cases', { page, search: searchQuery, status: statusFilter }],
    queryFn: () => caseApi.getAll({ page, search: searchQuery, status: statusFilter }),
    staleTime: 1000,
    keepPreviousData: true,
  });

  const cases = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  // ✅ Arama yap
  const handleSearch = () => {
    setSearchQuery(search);
  };

  // ✅ Enter tuşuna basınca arama yap
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // ✅ Durum değişince otomatik ara
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const statuses = [
    { value: '', label: 'Tümü' },
    { value: 'preparation', label: 'Hazırlık' },
    { value: 'active', label: 'Devam Ediyor' },
    { value: 'hearing', label: 'Duruşmada' },
    { value: 'appeal', label: 'İstinaf' },
    { value: 'cassation', label: 'Temyiz' },
    { value: 'concluded', label: 'Sonuçlandı' },
    { value: 'archived', label: 'Arşivlendi' },
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'preparation': return 'warning';
      case 'active': return 'success';
      case 'hearing': return 'info';
      case 'appeal': return 'warning';
      case 'cassation': return 'default';
      case 'concluded': return 'default';
      case 'archived': return 'danger';
      default: return 'default';
    }
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
        <h2 className="text-xl font-bold text-red-600">Davalar yüklenirken hata oluştu</h2>
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
          📁 Davalar
        </h1>
        <Link to="/cases/create">
          <Button>+ Yeni Dava</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Dava ara... (Enter ile ara)"
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
            <div className="sm:w-48">
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeadCell>Dava Adı</Table.HeadCell>
                <Table.HeadCell>Esas No</Table.HeadCell>
                <Table.HeadCell>Mahkeme</Table.HeadCell>
                <Table.HeadCell>Müvekkil</Table.HeadCell>
                <Table.HeadCell>Durum</Table.HeadCell>
                <Table.HeadCell>İşlem</Table.HeadCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {cases.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan="6" className="text-center py-8 text-gray-500">
                    Henüz dava bulunmuyor
                  </Table.Cell>
                </Table.Row>
              ) : (
                cases.map((caseItem) => (
                  <Table.Row key={caseItem.id}>
                    <Table.Cell>
                      <div className="font-medium">{caseItem.title}</div>
                      <div className="text-sm text-gray-500">{caseItem.case_type || '-'}</div>
                    </Table.Cell>
                    <Table.Cell>{caseItem.case_number || '-'}</Table.Cell>
                    <Table.Cell>{caseItem.court_name || '-'}</Table.Cell>
                    <Table.Cell>
                      {caseItem.client?.first_name} {caseItem.client?.last_name}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={getStatusVariant(caseItem.status)}>
                        {statuses.find(s => s.value === caseItem.status)?.label || caseItem.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Link
                        to={`/cases/${caseItem.id}`}
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
              Toplam {pagination.total} dava
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

export default CasesList;