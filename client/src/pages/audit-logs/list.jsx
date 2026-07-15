import { useState, useEffect } from 'react';
import auditLogApi from '../../features/audit-log/auditLog.api.js';
import { useAuth } from '../../app/providers/auth.provider.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { Eye, Search, X, Trash2, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';

const AuditLogList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [filters, setFilters] = useState({
    action: '',
    entity_type: '',
    startDate: '',
    endDate: '',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await auditLogApi.getAll({ ...filters, page, limit: 20 });
      setLogs(response?.data?.data || []);
      setPagination(response?.data?.pagination || null);
    } catch (err) {
      console.error('❌ API hatası:', err);
      setError(err.message || 'Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters, page]);

  // ✅ Tekil sil
  const handleDelete = async (id) => {
    if (!isAdmin) {
      toast.error('Bu işlem için yetkiniz yok');
      return;
    }
    if (window.confirm('Bu log kaydını silmek istediğinize emin misiniz?')) {
      try {
        await auditLogApi.delete(id);
        toast.success('Log silindi');
        fetchLogs();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Log silinemedi');
      }
    }
  };

  // ✅ Toplu sil
  const handleBulkDelete = async () => {
    if (!isAdmin) {
      toast.error('Bu işlem için yetkiniz yok');
      return;
    }
    if (selectedIds.length === 0) {
      toast.error('Lütfen silinecek logları seçin');
      return;
    }
    if (window.confirm(`${selectedIds.length} log kaydını silmek istediğinize emin misiniz?`)) {
      try {
        await Promise.all(selectedIds.map(id => auditLogApi.delete(id)));
        toast.success(`${selectedIds.length} log silindi`);
        setSelectedIds([]);
        fetchLogs();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Loglar silinemedi');
      }
    }
  };

  // ✅ Seçim işlemleri
  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === logs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(logs.map(l => l.id));
    }
  };

  const getActionVariant = (action) => {
    const variants = {
      create: 'success',
      update: 'warning',
      delete: 'danger',
      view: 'info',
      login: 'primary',
      logout: 'secondary',
      upload: 'success',
      download: 'info',
      share: 'warning',
    };
    return variants[action] || 'default';
  };

  const getActionLabel = (action) => {
    const labels = {
      create: 'Oluşturdu',
      update: 'Güncelledi',
      delete: 'Sildi',
      view: 'Görüntüledi',
      login: 'Giriş Yaptı',
      logout: 'Çıkış Yaptı',
      upload: 'Yükledi',
      download: 'İndirdi',
      share: 'Paylaştı',
    };
    return labels[action] || action;
  };

  const getEntityLabel = (type) => {
    const labels = {
      case: 'Dava',
      client: 'Müvekkil',
      task: 'Görev',
      event: 'Duruşma',
      meeting: 'Toplantı',
      document: 'Belge',
      payment: 'Ödeme',
      user: 'Kullanıcı',
      case_party: 'Taraf',
      notification: 'Bildirim',
    };
    return labels[type] || type;
  };

  const resetFilters = () => {
    setFilters({
      action: '',
      entity_type: '',
      startDate: '',
      endDate: '',
      search: '',
    });
    setPage(1);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: tr });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">⚠️ Hata: {error}</p>
        <button
          onClick={fetchLogs}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📋 Denetim Logları
          </h1>
          <p className="text-sm text-gray-500">
            Sistemde yapılan tüm işlemlerin kayıtları
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && selectedIds.length > 0 && (
            <Button variant="danger" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-1" />
              Seçilenleri Sil ({selectedIds.length})
            </Button>
          )}
          <Button variant="outline" onClick={fetchLogs}>
            🔄 Yenile
          </Button>
        </div>
      </div>

      {/* Filtreler */}
      <Card>
        <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="🔍 Ara..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Tüm İşlemler</option>
            <option value="create">Oluşturma</option>
            <option value="update">Güncelleme</option>
            <option value="delete">Silme</option>
            <option value="login">Giriş</option>
            <option value="logout">Çıkış</option>
            <option value="upload">Yükleme</option>
            <option value="download">İndirme</option>
          </select>
          <select
            value={filters.entity_type}
            onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
            className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Tüm Modüller</option>
            <option value="case">Dava</option>
            <option value="client">Müvekkil</option>
            <option value="task">Görev</option>
            <option value="event">Duruşma</option>
            <option value="meeting">Toplantı</option>
            <option value="document">Belge</option>
            <option value="user">Kullanıcı</option>
            <option value="case_party">Taraf</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div className="px-4 pb-4 flex gap-2">
          <Button size="sm" onClick={() => setPage(1)}>Filtrele</Button>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <X className="w-4 h-4 mr-1" /> Temizle
          </Button>
        </div>
      </Card>

      {/* Log Listesi */}
      <Card>
        <Card.Body>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Log kaydı bulunamadı</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {isAdmin && (
                      <th className="px-2 py-2 text-center">
                        <button onClick={toggleSelectAll}>
                          {selectedIds.length === logs.length ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </th>
                    )}
                    <th className="px-4 py-2 text-left">İşlem</th>
                    <th className="px-4 py-2 text-left">Modül</th>
                    <th className="px-4 py-2 text-left">Açıklama</th>
                    <th className="px-4 py-2 text-left">Kullanıcı</th>
                    <th className="px-4 py-2 text-left">Tarih</th>
                    <th className="px-4 py-2 text-left">IP</th>
                    <th className="px-4 py-2 text-center">Detay</th>
                    {isAdmin && (
                      <th className="px-4 py-2 text-center">Sil</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      {isAdmin && (
                        <td className="px-2 py-2 text-center">
                          <button onClick={() => toggleSelect(log.id)}>
                            {selectedIds.includes(log.id) ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </td>
                      )}
                      <td className="px-4 py-2">
                        <Badge variant={getActionVariant(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-gray-600 dark:text-gray-300">
                          {getEntityLabel(log.entity_type)}
                        </span>
                      </td>
                      <td className="px-4 py-2 max-w-xs truncate text-gray-700 dark:text-gray-200">
                        {log.description || '-'}
                      </td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                        {log.user?.first_name} {log.user?.last_name}
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-500">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-400">
                        {log.ip_address || '-'}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500">
                Toplam {pagination.total} kayıt
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Önceki
                </Button>
                <span className="px-3 py-1 text-sm">
                  {page} / {pagination.totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ✅ Detay Modalı */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">📋 Log Detayı</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">İşlem</p>
                  <Badge variant={getActionVariant(selectedLog.action)}>
                    {getActionLabel(selectedLog.action)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Modül</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getEntityLabel(selectedLog.entity_type)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Açıklama</p>
                <p className="text-gray-900 dark:text-white">
                  {selectedLog.description || '-'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Kullanıcı</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedLog.user?.first_name} {selectedLog.user?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedLog.user?.email || '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tarih</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(selectedLog.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">IP Adresi</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedLog.ip_address || '-'}
                  </p>
                </div>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Metadata</p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.old_values && (
                <div>
                  <p className="text-sm text-gray-500">Eski Değerler</p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <p className="text-sm text-gray-500">Yeni Değerler</p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedLog(null)}>
                Kapat
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogList;