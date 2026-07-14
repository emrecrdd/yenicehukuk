import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clientApi from '../../features/clients/client.api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';

const ClientsList = () => {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['clients', { page, search: searchQuery }],
    queryFn: () => clientApi.getAll({ page, search: searchQuery }),
    staleTime: 1000,
    keepPreviousData: true,
  });

  const clients = data?.data?.data?.filter(client => client?.id) || [];
  const pagination = data?.data?.pagination;

  const handleSearch = () => {
    setSearchQuery(search);
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Bir hata oluştu: {error.message}</p>
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
          👤 Müvekkiller
        </h1>
        <Link to="/clients/create">
          <Button>+ Yeni Müvekkil</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Müvekkil ara... (Enter ile ara)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                icon="🔍"
              />
            </div>
            <Button 
              variant="primary" 
              onClick={handleSearch}
              className="shrink-0"
            >
              Ara
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeadCell>#</Table.HeadCell>
                <Table.HeadCell>Ad Soyad / Unvan</Table.HeadCell>
                <Table.HeadCell>Telefon</Table.HeadCell>
                <Table.HeadCell>Dava</Table.HeadCell>
                <Table.HeadCell>Durum</Table.HeadCell>
                <Table.HeadCell>İşlem</Table.HeadCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {clients.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan="6" className="text-center py-8 text-gray-500">
                    {searchQuery ? 'Aramanıza uygun müvekkil bulunamadı' : 'Henüz müvekkil bulunmuyor'}
                  </Table.Cell>
                </Table.Row>
              ) : (
                clients.map((client, index) => (
                  <Table.Row key={client.id}>
                    <Table.Cell>{index + 1}</Table.Cell>
                    <Table.Cell>
                      <div>
                        <div className="font-medium">
                          {client.name}
                        </div>
                        {client.client_type && (
                          <div className="text-sm text-gray-500">
                            {client.client_type === 'corporate' ? '🏢 Kurumsal' : '👤 Bireysel'}
                          </div>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>{client.phone || '-'}</Table.Cell>
                    <Table.Cell>{client.cases?.length || 0}</Table.Cell>
                    <Table.Cell>
                      <Badge
                        variant={
                          client.status === 'active'
                            ? 'success'
                            : client.status === 'passive'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {client.status === 'active'
                          ? 'Aktif'
                          : client.status === 'passive'
                          ? 'Pasif'
                          : 'Arşiv'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Link
                        to={`/clients/${client.id}`}
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
              Toplam {pagination.total} müvekkil
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

export default ClientsList;
