import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { templateApi } from '../../features/templates/template.api.js';
import Badge from '../../components/ui/Badge.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import toast from 'react-hot-toast';

const TemplateDetail = () => {
  const { id } = useParams();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['template', id],
    queryFn: () => templateApi.getOne(id),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => templateApi.delete(id),
    onSuccess: () => {
      toast.success('Şablon silindi');
      window.location.href = '/templates';
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Silme başarısız');
    },
  });

  const template = data?.data?.data;

  const categoryLabels = {
    dilekce: '📝 Dilekçe',
    ihtar: '⚡ İhtar',
    sozlesme: '📄 Sözleşme',
  };

  const lawAreaLabels = {
    ozel_hukuk: '🏛️ Özel Hukuk',
    ceza_hukuku: '⚖️ Ceza Hukuku',
    idare_hukuku: '🏢 İdare Hukuku',
    ofis_ici: '📋 Ofis İçi',
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = async () => {
    try {
      const response = await templateApi.download(id);
      const { downloadUrl, fileName } = response.data.data;
      window.open(downloadUrl, '_blank');
      toast.success('İndirme başlatıldı');
      refetch();
    } catch (error) {
      toast.error('İndirilemedi');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Bu şablonu silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Şablon bulunamadı</p>
        <Link to="/templates" className="text-blue-600 hover:underline">
          ← Şablonlara Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/templates" className="text-blue-600 hover:underline">
            ← Şablonlar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {template.title}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="default">{categoryLabels[template.category] || template.category}</Badge>
            <Badge variant="default">{lawAreaLabels[template.law_area] || template.law_area}</Badge>
            <Badge variant="default">v{template.version}</Badge>
            <Badge variant={template.is_active ? 'success' : 'danger'}>
              {template.is_active ? 'Aktif' : 'Pasif'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            ⬇️ İndir
          </Button>
          <Link to={`/templates/${template.id}/edit`}>
            <Button variant="outline">✏️ Düzenle</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} loading={deleteMutation.isPending}>
            🗑️ Sil
          </Button>
        </div>
      </div>

      {/* BİLGİLER KARTI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">📋 Bilgiler</h2>
          </Card.Header>
          <Card.Body className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Başlık</p>
              <p className="text-gray-900 dark:text-white">{template.title}</p>
            </div>
            {template.description && (
              <div>
                <p className="text-sm text-gray-500">Açıklama</p>
                <p className="text-gray-900 dark:text-white">{template.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Kategori</p>
              <p className="text-gray-900 dark:text-white">{categoryLabels[template.category] || template.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hukuk Alanı</p>
              <p className="text-gray-900 dark:text-white">{lawAreaLabels[template.law_area] || template.law_area}</p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">📊 İstatistikler</h2>
          </Card.Header>
          <Card.Body className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Versiyon</p>
              <p className="text-gray-900 dark:text-white">v{template.version}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">İndirme Sayısı</p>
              <p className="text-gray-900 dark:text-white">{template.download_count || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Oluşturan</p>
              <p className="text-gray-900 dark:text-white">
                {template.creator?.first_name} {template.creator?.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Oluşturulma Tarihi</p>
              <p className="text-gray-900 dark:text-white">{formatDate(template.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Son Güncelleme</p>
              <p className="text-gray-900 dark:text-white">{formatDate(template.updated_at)}</p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* DOSYA BİLGİSİ */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold text-gray-900 dark:text-white">📎 Dosya Bilgileri</h2>
        </Card.Header>
        <Card.Body>
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-4xl">📄</span>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{template.file_name}</p>
              <p className="text-sm text-gray-500">
                {template.file_type} • {template.file_size ? (template.file_size / 1024).toFixed(1) : 0} KB
              </p>
            </div>
            <Button variant="primary" onClick={handleDownload}>
              ⬇️ İndir
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TemplateDetail;