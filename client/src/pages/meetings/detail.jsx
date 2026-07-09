import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import meetingApi from '../../features/meetings/meeting.api.js'; // ✅ meetingApi kullan
import Badge from '../../components/ui/Badge.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const MeetingDetail = () => {
  const { id } = useParams();

  // ✅ meetingApi ile getir
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['meeting', id],
    queryFn: () => meetingApi.getOne(id),
  });

  // ✅ meetingApi ile güncelle
  const updateStatus = useMutation({
    mutationFn: (status) => meetingApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Toplantı durumu güncellendi');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Durum güncellenemedi');
    },
  });

  const meeting = data?.data?.data;

  const statuses = [
    { value: 'scheduled', label: 'Planlandı' },
    { value: 'ongoing', label: 'Devam Ediyor' },
    { value: 'completed', label: 'Tamamlandı' },
    { value: 'cancelled', label: 'İptal' },
  ];

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
    return dayjs(date).format('DD MMMM YYYY HH:mm');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Toplantı bulunamadı</p>
        <Link to="/meetings" className="text-blue-600 hover:underline">
          ← Toplantılara Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/meetings" className="text-blue-600 hover:underline">
            ← Toplantılar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {meeting.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={getStatusVariant(meeting.status)}>
              {getStatusLabel(meeting.status)}
            </Badge>
            <Badge variant="default">🤝 Toplantı</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={meeting.status}
            onChange={(e) => updateStatus.mutate(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={updateStatus.isPending}
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <Link to={`/meetings/${meeting.id}/edit`}>
            <Button variant="outline">Düzenle</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">📋 Bilgiler</h2>
          </Card.Header>
          <Card.Body className="space-y-3">
            {meeting.description && (
              <div>
                <p className="text-sm text-gray-500">Açıklama</p>
                <p className="text-gray-900 dark:text-white">{meeting.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Başlangıç</p>
              <p className="text-gray-900 dark:text-white">{formatDate(meeting.start_date)}</p>
            </div>
            {meeting.end_date && (
              <div>
                <p className="text-sm text-gray-500">Bitiş</p>
                <p className="text-gray-900 dark:text-white">{formatDate(meeting.end_date)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Yer</p>
              <p className="text-gray-900 dark:text-white">{meeting.location || 'Belirtilmemiş'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Toplantı Türü</p>
              <p className="text-gray-900 dark:text-white">
                {meeting.meeting_type === 'client' ? '👤 Müvekkil Görüşmesi' :
                 meeting.meeting_type === 'internal' ? '🏢 İç Toplantı' :
                 meeting.meeting_type === 'phone' ? '📞 Telefon Görüşmesi' :
                 '📌 Diğer'}
              </p>
            </div>
            {meeting.meeting_link && (
              <div>
                <p className="text-sm text-gray-500">Toplantı Linki</p>
                <a
                  href={meeting.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {meeting.meeting_link}
                </a>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Atanan Avukat</p>
              <p className="text-gray-900 dark:text-white">
                {meeting.assignee?.first_name} {meeting.assignee?.last_name || 'Atanmadı'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Oluşturan</p>
              <p className="text-gray-900 dark:text-white">
                {meeting.creator?.first_name} {meeting.creator?.last_name}
              </p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">🔗 İlişkili</h2>
          </Card.Header>
          <Card.Body className="space-y-3">
            {meeting.case && (
              <div>
                <p className="text-sm text-gray-500">Dava</p>
                <Link
                  to={`/cases/${meeting.case.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {meeting.case.title}
                </Link>
              </div>
            )}
            {meeting.client && (
              <div>
                <p className="text-sm text-gray-500">Müvekkil</p>
                <Link
                  to={`/clients/${meeting.client.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {meeting.client.first_name} {meeting.client.last_name}
                  {meeting.client.company_name && ` (${meeting.client.company_name})`}
                </Link>
              </div>
            )}
            {meeting.attendees && meeting.attendees.length > 0 && (
              <div>
                <p className="text-sm text-gray-500">👥 Katılımcılar</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {meeting.attendees.map((attendee, index) => (
                    <Badge key={index} variant="default">
                      {typeof attendee === 'string' ? attendee : attendee.name}
                      {attendee.role && ` (${attendee.role})`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {meeting.notes && (
              <div>
                <p className="text-sm text-gray-500">Notlar</p>
                <p className="text-gray-900 dark:text-white">{meeting.notes}</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default MeetingDetail;