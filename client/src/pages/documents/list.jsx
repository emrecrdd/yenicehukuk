import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import documentApi from '../../features/documents/document.api.js';
import Button from '../../components/ui/Button.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import toast from 'react-hot-toast';

const DocumentsList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedDocs, setSelectedDocs] = useState([]);
  
  const debouncedSearch = useDebounce(search, 500); // ✅ 500ms yaptım

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['documents', { page, search: debouncedSearch, category: categoryFilter }],
    queryFn: () => documentApi.getAll({ page, search: debouncedSearch, category: categoryFilter }),
    staleTime: 1000,
    keepPreviousData: true,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['document-categories'],
    queryFn: () => documentApi.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const documents = data?.data?.data || [];
  const pagination = data?.data?.pagination;
  const categories = Array.isArray(categoriesData?.data) ? categoriesData.data : [];

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // ✅ SİLME MUTATION
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      console.log('🗑️ Silme isteği gönderiliyor. ID:', id);
      const response = await documentApi.delete(id);
      console.log('✅ Silme yanıtı:', response);
      return response;
    },
    onSuccess: (response, id) => {
      console.log('✅ Silme başarılı! ID:', id);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Belge silindi');
    },
    onError: (error, id) => {
      console.error('❌ Silme hatası! ID:', id, error);
      
      if (error.response?.status === 401) {
        toast.error('Oturumunuz sona erdi, lütfen tekrar giriş yapın');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setTimeout(() => window.location.href = '/login', 1500);
      } else if (error.response?.status === 403) {
        toast.error('Bu işlem için yetkiniz yok');
      } else {
        toast.error(error.response?.data?.message || 'Belge silinemedi');
      }
    },
  });

  // ✅ TOPLU SİLME MUTATION
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      console.log('🗑️ Toplu silme isteği. ID\'ler:', ids);
      return await Promise.all(ids.map(id => documentApi.delete(id)));
    },
    onSuccess: (results, ids) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success(`${ids.length} belge silindi`);
      setSelectedDocs([]);
    },
    onError: (error) => {
      console.error('❌ Toplu silme hatası:', error);
      toast.error(error.response?.data?.message || 'Belgeler silinemedi');
    },
  });

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

  const handleDownload = async (doc) => {
    try {
      const response = await documentApi.download(doc.id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      let fileName = doc.original_name || doc.name;
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

  const handleDelete = (doc) => {
    console.log('🗑️ Silme butonuna tıklandı. Belge:', doc);
    
    if (!doc || !doc.id) {
      toast.error('Geçersiz belge!');
      return;
    }
    
    const confirmed = window.confirm(
      `"${doc.name}" belgesini silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz!`
    );
    
    if (confirmed) {
      console.log('🗑️ Silme onaylandı. ID:', doc.id);
      deleteMutation.mutate(doc.id);
    } else {
      console.log('🚫 Silme iptal edildi');
    }
  };

  const handleBulkDelete = () => {
    if (selectedDocs.length === 0) return;
    
    if (window.confirm(`${selectedDocs.length} belgeyi silmek istediğinize emin misiniz?`)) {
      bulkDeleteMutation.mutate(selectedDocs);
    }
  };

  const toggleSelect = (id) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDocs.length === documents.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(documents.map(doc => doc.id));
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
    console.error('❌ Liste hatası:', error);
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-red-600">Belgeler yüklenirken hata oluştu</h2>
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📄 Belgeler</h1>
          <p className="text-sm text-gray-500">Toplam {pagination?.total || 0} belge</p>
        </div>
        <div className="flex gap-2">
          {selectedDocs.length > 0 && (
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>
              🗑️ Seçili Sil ({selectedDocs.length})
            </Button>
          )}
          <Link to="/documents/upload">
            <Button>+ Belge Yükle</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* ✅ INPUT DOĞRUDAN KULLANILIYOR - ODAK KAYBETMEZ */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Belge ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 pl-10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <div className="sm:w-48">
              <select
                value={categoryFilter}
                onChange={handleCategoryChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryLabel(category)}
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
                <Table.HeadCell className="w-8">
                  <input
                    type="checkbox"
                    checked={selectedDocs.length === documents.length && documents.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </Table.HeadCell>
                <Table.HeadCell>Dosya</Table.HeadCell>
                <Table.HeadCell>Ad</Table.HeadCell>
                <Table.HeadCell>Kategori</Table.HeadCell>
                <Table.HeadCell>İlişkili Dava</Table.HeadCell>
                <Table.HeadCell>Boyut</Table.HeadCell>
                <Table.HeadCell>Yükleyen</Table.HeadCell>
                <Table.HeadCell>Tarih</Table.HeadCell>
                <Table.HeadCell>İşlemler</Table.HeadCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {documents.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan="9" className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    Henüz belge bulunmuyor
                    <div className="mt-2">
                      <Link to="/documents/upload" className="text-blue-600 hover:underline">
                        İlk belgeni yükle
                      </Link>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : (
                documents.map((doc) => (
                  <Table.Row key={doc.id}>
                    <Table.Cell>
                      <input
                        type="checkbox"
                        checked={selectedDocs.includes(doc.id)}
                        onChange={() => toggleSelect(doc.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-2xl">{getFileIcon(doc.file_type)}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <Link 
                        to={`/documents/${doc.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {doc.name}
                      </Link>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {doc.original_name}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {doc.category && (
                        <Badge variant="default" className={getCategoryColor(doc.category)}>
                          {getCategoryLabel(doc.category)}
                        </Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {doc.case ? (
                        <Link 
                          to={`/cases/${doc.case.id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {doc.case.title}
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </Table.Cell>
                    <Table.Cell>{formatFileSize(doc.file_size)}</Table.Cell>
                    <Table.Cell>
                      {doc.uploader?.first_name} {doc.uploader?.last_name}
                    </Table.Cell>
                    <Table.Cell className="text-sm text-gray-500">
                      {formatDate(doc.created_at)}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-green-600 hover:text-green-800 text-sm p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          title="İndir"
                        >
                          ⬇️
                        </button>
                        <button
                          onClick={() => navigate(`/documents/${doc.id}/edit`)}
                          className="text-blue-600 hover:text-blue-800 text-sm p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Düzenle"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          className="text-red-500 hover:text-red-700 text-sm p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
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
              Toplam {pagination.total} belge
              {selectedDocs.length > 0 && ` (${selectedDocs.length} seçili)`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
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
                onClick={() => handlePageChange(page + 1)}
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

export default DocumentsList;