import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import auditLogApi from '../../features/audit-log/auditLog.api.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';  // ✅ DÜZELTİLDİ

const AuditLogDetail = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', id],
    queryFn: () => auditLogApi.getOne(id),
    enabled: !!id,
  });

  const log = data?.data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Log bulunamadı</p>
        <Link to="/audit-logs" className="text-blue-600 hover:underline">
          ← Loglara Dön
        </Link>
      </div>
    );
  }

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

  const formatDate = (date) => {
    if (!date) return '-';
    return format(new Date(date), 'dd.MM.yyyy HH:mm:ss', { locale: tr });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/audit-logs" className="text-blue-600 hover:underline">
            ← Loglar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            📋 Log Detayı
          </h1>
        </div>
        <Link to="/audit-logs">
          <Button variant="outline">Listeye Dön</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temel Bilgiler */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold">📌 Temel Bilgiler</h2>
          </Card.Header>
          <Card.Body className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">İşlem</p>
              <Badge>{getActionLabel(log.action)}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Modül</p>
              <p className="font-medium">{getEntityLabel(log.entity_type)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Kayıt ID</p>
              <p className="font-mono text-sm">{log.entity_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Açıklama</p>
              <p>{log.description || '-'}</p>
            </div>
          </Card.Body>
        </Card>

        {/* Kullanıcı & Zaman */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold">👤 Kullanıcı & Zaman</h2>
          </Card.Header>
          <Card.Body className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Kullanıcı</p>
              <p className="font-medium">
                {log.user?.first_name} {log.user?.last_name}
              </p>
              <p className="text-sm text-gray-400">{log.user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tarih</p>
              <p>{formatDate(log.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">IP Adresi</p>
              <p className="font-mono text-sm">{log.ip_address || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cihaz / Tarayıcı</p>
              <p className="text-sm break-all">{log.user_agent || '-'}</p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Değişim Detayları */}
      {(log.old_values || log.new_values) && (
        <Card>
          <Card.Header>
            <h2 className="font-semibold">🔄 Değişim Detayları</h2>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {log.old_values && (
                <div>
                  <p className="text-sm font-medium text-red-600 mb-2">❌ Eski Değerler</p>
                  <pre className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-xs overflow-auto max-h-60 border border-red-200 dark:border-red-800">
                    {JSON.stringify(log.old_values, null, 2)}
                  </pre>
                </div>
              )}
              {log.new_values && (
                <div>
                  <p className="text-sm font-medium text-green-600 mb-2">✅ Yeni Değerler</p>
                  <pre className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md text-xs overflow-auto max-h-60 border border-green-200 dark:border-green-800">
                    {JSON.stringify(log.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Metadata */}
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <Card>
          <Card.Header>
            <h2 className="font-semibold">📦 Metadata</h2>
          </Card.Header>
          <Card.Body>
            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-xs overflow-auto max-h-60">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default AuditLogDetail;