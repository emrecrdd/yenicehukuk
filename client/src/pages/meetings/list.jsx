import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import meetingApi from '../../features/meetings/meeting.api.js'; // ✅ meetingApi kullan
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';

const MeetingsList = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  // ✅ meetingApi kullan - event_type filtrelemesine gerek yok
  const { data, isLoading } = useQuery({
    queryKey: ['meetings', { page, search: debouncedSearch }],
    queryFn: () => meetingApi.getAll({
      page,
      search: debouncedSearch,
    }),
    staleTime: 1000,
    keepPreviousData: true,
  });

  const meetings = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const getStatusVariant = (status) => {
    switch (status) {
      case 'scheduled': return 'warning';
      case 'ongoing': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: 'Planlandı',
      ongoing: 'Devam Ediyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal',
    };
    return labels[status] || status;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
           🤝 Toplantılar
          </h1>
          <p className="text-sm text-gray-500">
            Toplam {pagination?.total || 0} toplantı
          </p>
        </div>
        <Link to="/meetings/create">
          <Button>+ Yeni Toplantı</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Input
            placeholder="Toplantı ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon="🔍"
          />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeadCell>Başlık</Table.HeadCell>
                <Table.HeadCell>Müvekkil</Table.HeadCell>
                <Table.HeadCell>Dava</Table.HeadCell>
                <Table.HeadCell>Tarih</Table.HeadCell>
                <Table.HeadCell>Yer</Table.HeadCell>
                <Table.HeadCell>Durum</Table.HeadCell>
                <Table.HeadCell>İşlem</Table.HeadCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {meetings.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan="7" className="text-center py-8 text-gray-500">
                    Henüz toplantı bulunmuyor
                  </Table.Cell>
                </Table.Row>
              ) : (
                meetings.map((meeting) => (
                  <Table.Row key={meeting.id}>
                    <Table.Cell>
                      <div className="font-medium">{meeting.title}</div>
                      {meeting.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {meeting.description}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {meeting.client?.first_name} {meeting.client?.last_name || '-'}
                    </Table.Cell>
                    <Table.Cell>
                      {meeting.case?.title || '-'}
                    </Table.Cell>
                    <Table.Cell className="text-sm">
                      {formatDate(meeting.start_date)}
                    </Table.Cell>
                    <Table.Cell>{meeting.location || '-'}</Table.Cell>
                    <Table.Cell>
                      <Badge variant={getStatusVariant(meeting.status)}>
                        {getStatusLabel(meeting.status)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Link
                        to={`/meetings/${meeting.id}`}
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
              Toplam {pagination.total} toplantı
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

export default MeetingsList;