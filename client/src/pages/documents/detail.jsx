import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import documentApi from '../../features/documents/document.api.js';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import toast from 'react-hot-toast';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentApi.getOne(id),
    enabled: !!id,
  });

  // ✅ BURASI DÜZELTİLDİ - data.data değil, data
const document = data?.data?.data;
  // ✅ DEBUG - Backend'den gelen veriyi göster
  console.log('📄 TÜM DATA:', data);
  console.log('📄 document:', document);
  console.log('📌 uploader:', document?.uploader);
  console.log('📌 case:', document?.case);
  console.log('📌 client:', document?.client);
  console.log('📌 tags:', document?.tags);
  console.log('📌 description:', document?.description);

  const handleDownload = async () => {
    try {
      const response = await documentApi.download(id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      let fileName = document.original_name || document.name;
      try {
        fileName = decodeURIComponent(escape(fileName));
      } catch (e) {}
      link.setAttribute('download', fileName);
      
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

  const getCategoryLabel = (category) => {
    const labels = {
      general: 'Genel',
      petition: 'Dilekçe',
      expert_report: 'Bilirkişi Raporu',
      court_decision: 'Mahkeme Kararı',
      notification: 'Tebligat',
      evidence: 'Delil',
      correspondence: 'Yazışma',
      other: 'Diğer',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      petition: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      expert_report: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      court_decision: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      notification: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      evidence: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      correspondence: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[category] || colors.general;
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

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('tr-TR', {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (error || !document) {
    console.error('❌ Hata veya belge yok:', error);
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📄</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Belge Bulunamadı</h2>
        <p className="text-gray-500">{error?.message || 'Belge detayları yüklenemedi'}</p>
        <Link to="/documents" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Belgeler Listesine Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/documents" className="text-blue-600 hover:underline">← Belgeler</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{document.name}</h1>
          <p className="text-sm text-gray-500">{document.original_name}</p>
        </div>
        <div className="flex gap-2">
         
          <Button variant="secondary" onClick={() => navigate(`/documents/${id}/edit`)}>✏️ Düzenle</Button>
        </div>
      </div>

      <Card>
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <span className="text-5xl">{getFileIcon(document.file_type)}</span>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Orijinal Dosya Adı</p>
              <p className="font-medium text-gray-900 dark:text-white">{document.original_name}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="default" className="text-xs">{formatFileSize(document.file_size)}</Badge>
                <Badge variant="default" className="text-xs">{document.mime_type || 'Bilinmiyor'}</Badge>
                {document.file_type && (
                  <Badge variant="default" className="text-xs uppercase">{document.file_type}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kategori */}
            <div>
              <p className="text-sm text-gray-500">Kategori</p>
              <Badge className={`mt-1 ${getCategoryColor(document.category)}`}>
                {getCategoryLabel(document.category)}
              </Badge>
            </div>

            {/* Yükleyen */}
            <div>
              <p className="text-sm text-gray-500">Yükleyen</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {document.uploader?.first_name} {document.uploader?.last_name}
              </p>
              {document.uploader?.email && (
                <p className="text-sm text-gray-500">{document.uploader.email}</p>
              )}
            </div>

            {/* Yüklenme Tarihi */}
            <div>
              <p className="text-sm text-gray-500">Yüklenme Tarihi</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(document.created_at)}</p>
            </div>

            {/* Son Güncelleme */}
            <div>
              <p className="text-sm text-gray-500">Son Güncelleme</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(document.updated_at)}</p>
            </div>

            {/* İlişkili Dava */}
            <div>
              <p className="text-sm text-gray-500">İlişkili Dava</p>
              {document.case ? (
                <Link to={`/cases/${document.case.id}`} className="font-medium text-blue-600 hover:underline">
                  {document.case.title}
                  {document.case.case_number && (
                    <span className="text-sm text-gray-500 block">Dosya No: {document.case.case_number}</span>
                  )}
                </Link>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>

            {/* İlişkili Müvekkil */}
            <div>
              <p className="text-sm text-gray-500">İlişkili Müvekkil</p>
              {document.client ? (
                <Link to={`/clients/${document.client.id}`} className="font-medium text-blue-600 hover:underline">
                  {document.client.first_name} {document.client.last_name}
                  {document.client.company_name && (
                    <span className="text-sm text-gray-500 block">{document.client.company_name}</span>
                  )}
                  {document.client.tc_number && (
                    <span className="text-sm text-gray-500 block">TC: {document.client.tc_number}</span>
                  )}
                </Link>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>

            {/* Herkese Açık */}
            <div>
              <p className="text-sm text-gray-500">Herkese Açık</p>
              <Badge className={`mt-1 ${document.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {document.is_public ? '🌐 Evet' : '🔒 Hayır'}
              </Badge>
            </div>

            {/* Versiyon */}
            {document.version && document.version > 1 && (
              <div>
                <p className="text-sm text-gray-500">Versiyon</p>
                <Badge variant="default" className="mt-1">v{document.version}</Badge>
              </div>
            )}
          </div>

          {/* Etiketler */}
          {document.tags && document.tags.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Etiketler</p>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag, index) => (
                  <Badge key={index} variant="default" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Açıklama */}
          {document.description && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Açıklama</p>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{document.description}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DocumentDetail;