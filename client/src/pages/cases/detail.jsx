import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import caseApi from '../../features/cases/case.api.js';
import documentApi from '../../features/documents/document.api.js';
import Badge from '../../components/ui/Badge.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CaseDetail = () => {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['case', id],
    queryFn: () => caseApi.getOne(id),
    enabled: !!id,
  });

  const caseItem = data?.data?.data;

  // ✅ İNDİRME FONKSİYONU - token gönderir
  const handleDownload = async (doc) => {
    try {
      const response = await documentApi.download(doc.id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.original_name || doc.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Dosya indirildi');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Dosya indirilemedi');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !caseItem) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Dava bulunamadı</p>
        <Link to="/cases" className="text-blue-600 hover:underline">
          ← Davalara Dön
        </Link>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('tr-TR');
    } catch {
      return '-';
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleString('tr-TR');
    } catch {
      return '-';
    }
  };

  const statuses = [
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/cases" className="text-blue-600 hover:underline">
            ← Davalar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {caseItem.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">{caseItem.case_number || 'Esas no yok'}</span>
            <Badge variant={getStatusVariant(caseItem.status)}>
              {statuses.find(s => s.value === caseItem.status)?.label || caseItem.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/cases/${caseItem.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Düzenle
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">📋 Bilgiler</h2>
          </Card.Header>
          <Card.Body className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Mahkeme</p>
              <p className="text-gray-900 dark:text-white">{caseItem.court_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dava Türü</p>
              <p className="text-gray-900 dark:text-white">{caseItem.case_type || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Açılış Tarihi</p>
              <p className="text-gray-900 dark:text-white">{formatDate(caseItem.opening_date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Müvekkil</p>
              {caseItem.client ? (
                <Link
                  to={`/clients/${caseItem.client.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {caseItem.client.first_name} {caseItem.client.last_name}
                </Link>
              ) : (
                <p className="text-gray-900 dark:text-white">-</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Atanan Avukat</p>
              <p className="text-gray-900 dark:text-white">
                {caseItem.assignee?.first_name} {caseItem.assignee?.last_name || 'Atanmadı'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Öncelik</p>
              <Badge
                variant={
                  caseItem.priority === 'critical'
                    ? 'danger'
                    : caseItem.priority === 'high'
                    ? 'warning'
                    : caseItem.priority === 'normal'
                    ? 'default'
                    : 'default'
                }
              >
                {caseItem.priority || 'Normal'}
              </Badge>
            </div>
          </Card.Body>
        </Card>

       {/* 👥 TARAFLAR */}
<Card>
  <Card.Header className="flex items-center justify-between">
    <h2 className="font-semibold text-gray-900 dark:text-white">👥 Taraflar</h2>
    <Link to={`/cases/${caseItem.id}/parties/create`}>
      <Button size="sm">+ Taraf Ekle</Button>
    </Link>
  </Card.Header>
  <Card.Body>
    {caseItem.parties?.length === 0 ? (
      <p className="text-gray-500">Henüz taraf eklenmemiş</p>
    ) : (
      <div className="space-y-3">
        {caseItem.parties?.map((party) => (
          <div
            key={party.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {party.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {party.party_type === 'plaintiff' ? 'Davacı' :
                 party.party_type === 'defendant' ? 'Davalı' :
                 party.party_type === 'intervener' ? 'Müdahil' : 'Tanık'}
              </p>
            </div>
            {party.lawyer_name && (
              <span className="text-sm text-gray-500">
                Av. {party.lawyer_name}
              </span>
            )}
          </div>
        ))}
      </div>
    )}
  </Card.Body>
</Card>
      </div>

      {/* ✅ Documents - Görüntüle yok, İndir butonu çalışıyor */}
      <Card>
        <Card.Header className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">📄 Belgeler</h2>
          <Link to={`/documents/upload?case=${caseItem.id}`}>
            <Button size="sm">+ Belge Ekle</Button>
          </Link>
        </Card.Header>
        <Card.Body>
          {caseItem.documents?.length === 0 ? (
            <p className="text-gray-500">Henüz belge eklenmemiş</p>
          ) : (
            <div className="space-y-3">
              {caseItem.documents?.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Link 
                    to={`/documents/${doc.id}`}
                    className="flex-1 hover:underline"
                  >
                    <p className="font-medium text-blue-600 dark:text-blue-400">
                      {doc.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(doc.created_at)} - {(doc.file_size / 1024).toFixed(1)} KB
                    </p>
                  </Link>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    ⬇️ İndir
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ✅ Görevler - Görüntüle linki ve Görev Ekle butonu eklendi */}
      <Card>
        <Card.Header className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">✅ Görevler</h2>
          <Link to={`/tasks/create?case=${caseItem.id}`}>
            <Button size="sm">+ Görev Ekle</Button>
          </Link>
        </Card.Header>
        <Card.Body>
          {caseItem.tasks?.length === 0 ? (
            <p className="text-gray-500">Henüz görev eklenmemiş</p>
          ) : (
            <div className="space-y-3">
              {caseItem.tasks?.map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Atanan: {task.assignee?.first_name} {task.assignee?.last_name || 'Atanmadı'} - 
                      Son tarih: {formatDate(task.due_date)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      task.status === 'completed'
                        ? 'success'
                        : task.status === 'in_progress'
                        ? 'warning'
                        : task.status === 'cancelled'
                        ? 'danger'
                        : 'default'
                    }
                  >
                    {task.status === 'pending' ? 'Bekliyor' :
                     task.status === 'in_progress' ? 'Devam Ediyor' :
                     task.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Events */}
      <Card>
        <Card.Header className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">📅 Duruşmalar</h2>
          <Link to={`/events/create?case=${caseItem.id}`}>
            <Button size="sm">+ Duruşma Ekle</Button>
          </Link>
        </Card.Header>
        <Card.Body>
          {caseItem.events?.length === 0 ? (
            <p className="text-gray-500">Henüz duruşma eklenmemiş</p>
          ) : (
            <div className="space-y-3">
              {caseItem.events?.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(event.start_date)} - {event.location || 'Yer belirtilmemiş'}
                    </p>
                  </div>
                  <Badge
                    variant={
                      event.status === 'completed'
                        ? 'success'
                        : event.status === 'ongoing'
                        ? 'warning'
                        : event.status === 'cancelled'
                        ? 'danger'
                        : 'default'
                    }
                  >
                    {event.status === 'scheduled' ? 'Planlandı' :
                     event.status === 'ongoing' ? 'Devam Ediyor' :
                     event.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default CaseDetail;