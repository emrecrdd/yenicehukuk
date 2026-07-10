import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { powerOfAttorneyApi } from '../../features/power-of-attorney/powerOfAttorney.api.js';
import documentApi from '../../features/documents/document.api.js';  // ✅ EKLENDI
import Badge from '../../components/ui/Badge.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import toast from 'react-hot-toast';

const PowerOfAttorneyDetail = () => {
  const { id } = useParams();

  console.log('🔍 Detay ID:', id);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['powerOfAttorney', id],
    queryFn: () => powerOfAttorneyApi.getOne(id),
  });

  const item = data?.data?.data || data?.data;

  console.log('📦 Item:', item);

  const deleteMutation = useMutation({
    mutationFn: () => powerOfAttorneyApi.delete(id),
    onSuccess: () => {
      toast.success('Vekaletname silindi');
      window.location.href = '/power-of-attorney';
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Silme başarısız');
    },
  });

  const updateStatus = useMutation({
    mutationFn: (status) => powerOfAttorneyApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Durum güncellendi');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Durum güncellenemedi');
    },
  });

  // ✅ Belge indirme fonksiyonu
  const handleDownload = async (docId, docName) => {
    try {
      const response = await documentApi.download(docId);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = docName || 'belge';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Belge indirildi');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Belge indirilemedi');
    }
  };

  const statuses = [
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

  const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('tr-TR');
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return '📄';
      case 'word': return '📝';
      case 'excel': return '📊';
      case 'image': return '🖼️';
      default: return '📎';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !item) {
    console.error('❌ Hata veya item yok:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Vekaletname bulunamadı</p>
        <Link to="/power-of-attorney" className="text-blue-600 hover:underline">
          ← Vekaletnamelere Dön
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('Bu vekaletnameyi silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/power-of-attorney" className="text-blue-600 hover:underline">
            ← Vekaletnameler
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {item.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={getStatusVariant(item.status)}>
              {getStatusLabel(item.status)}
            </Badge>
            <Badge variant="default">📜 Vekaletname</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={item.status}
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
          <Link to={`/power-of-attorney/${item.id}/edit`}>
            <Button variant="outline">Düzenle</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} loading={deleteMutation.isPending}>
            Sil
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">📋 Bilgiler</h2>
          </Card.Header>
          <Card.Body className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Müvekkil</p>
              <Link to={`/clients/${item.client_id}`} className="text-blue-600 hover:underline">
                {item.client?.name || '-'}
              </Link>
            </div>
            {item.client?.identification_number && (
              <div>
                <p className="text-sm text-gray-500">TCKNO / VKN</p>
                <p className="text-gray-900 dark:text-white">{item.client.identification_number}</p>
              </div>
            )}
            {item.case && (
              <div>
                <p className="text-sm text-gray-500">İlişkili Dava</p>
                <Link to={`/cases/${item.case.id}`} className="text-blue-600 hover:underline">
                  {item.case.title} ({item.case.case_number || 'Esas no yok'})
                </Link>
              </div>
            )}
            {item.description && (
              <div>
                <p className="text-sm text-gray-500">Açıklama</p>
                <p className="text-gray-900 dark:text-white">{item.description}</p>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">⏰ Tarihler</h2>
          </Card.Header>
          <Card.Body className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Başlangıç Tarihi</p>
              <p className="text-gray-900 dark:text-white">{formatDate(item.start_date) || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bitiş Tarihi</p>
              <p className="text-gray-900 dark:text-white">{formatDate(item.end_date) || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Oluşturulma Tarihi</p>
              <p className="text-gray-900 dark:text-white">{formatDateTime(item.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Oluşturan</p>
              <p className="text-gray-900 dark:text-white">
                {item.creator ? `${item.creator.first_name} ${item.creator.last_name}` : '-'}
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {item.authorities && item.authorities.length > 0 && (
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">🔑 Yetkiler</h2>
          </Card.Header>
          <Card.Body>
            <div className="flex flex-wrap gap-2">
              {item.authorities.map((auth, index) => (
                <Badge key={index} variant="default">
                  {auth}
                </Badge>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* ✅ BELGELER BÖLÜMÜ */}
      {item.documents && item.documents.length > 0 && (
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">📎 Belgeler</h2>
              <Link to={`/documents/upload?power_of_attorney_id=${item.id}`}>
                <Button size="sm">+ Belge Ekle</Button>
              </Link>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-2">
              {item.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(doc.file_type)}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{doc.name || doc.original_name}</p>
                      <p className="text-sm text-gray-500">
                        {doc.file_size ? (doc.file_size / 1024).toFixed(1) : 0} KB
                        {doc.created_at && ` • ${formatDateTime(doc.created_at)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/documents/${doc.id}`} className="text-blue-600 hover:underline text-sm">
                      Görüntüle
                    </Link>
                    <button
                      onClick={() => handleDownload(doc.id, doc.original_name || doc.name)}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 text-sm flex items-center gap-1"
                    >
                      ⬇️ İndir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Eski Dosya (artık Documents ile entegre) */}
      {item.file_url && !item.documents?.length && (
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">📎 Dosya</h2>
          </Card.Header>
          <Card.Body>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-3xl">📄</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{item.file_name || 'Vekaletname'}</p>
                {item.file_size && (
                  <p className="text-sm text-gray-500">{(item.file_size / 1024).toFixed(1)} KB</p>
                )}
              </div>
              <a
                href={item.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                ⬇️ İndir
              </a>
            </div>
          </Card.Body>
        </Card>
      )}

      {item.notes && (
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">📝 Notlar</h2>
          </Card.Header>
          <Card.Body>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{item.notes}</p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default PowerOfAttorneyDetail;