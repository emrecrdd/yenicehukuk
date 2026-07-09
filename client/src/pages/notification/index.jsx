import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationApi from '../../features/notification/notification.api.js';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
import toast from 'react-hot-toast';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const NotificationsPage = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', { page }],
    queryFn: () => notificationApi.getMyNotifications({ page, limit: 20 }),
    staleTime: 60 * 1000,
  });

  const notifications = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  // ✅ Okundu işaretle
  const markAsRead = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
      toast.success('Bildirim okundu');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bildirim güncellenemedi');
    },
  });

  // ✅ Tümünü okundu işaretle
  const markAllAsRead = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
      toast.success('Tüm bildirimler okundu');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'İşlem başarısız');
    },
  });

  // ✅ Sil
  const deleteNotification = useMutation({
    mutationFn: (id) => notificationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
      toast.success('Bildirim silindi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bildirim silinemedi');
    },
  });

  // ✅ Tümünü sil
  const deleteAll = useMutation({
    mutationFn: () => notificationApi.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
      toast.success('Tüm bildirimler silindi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'İşlem başarısız');
    },
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'task': return '📋';
      case 'case': return '📁';
      case 'event': return '⚖️';
      case 'system': return '🔔';
      default: return '📌';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'case': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'event': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'system': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            🔔 Bildirimler
          </h1>
          <p className="text-sm text-gray-500">
            Toplam {pagination?.total || 0} bildirim
          </p>
        </div>
        <div className="flex gap-2">
          {notifications.some(n => !n.read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              loading={markAllAsRead.isPending}
            >
              ✅ Tümünü Okundu İşaretle
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (window.confirm('Tüm bildirimleri silmek istediğinize emin misiniz?')) {
                  deleteAll.mutate();
                }
              }}
              loading={deleteAll.isPending}
            >
              🗑️ Tümünü Sil
            </Button>
          )}
        </div>
      </div>

      {/* Bildirim Listesi */}
      <Card>
        <Card.Body>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">Henüz bildirim yok</p>
              <p className="text-sm text-gray-400 mt-1">Yeni bildirimler geldiğinde burada görünecek</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                    !notification.read
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                  </div>

                  {/* İçerik */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`text-xs ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {dayjs(notification.created_at).fromNow()}
                          </span>
                          {!notification.read && (
                            <Badge variant="warning" className="text-xs">
                              Yeni
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead.mutate(notification.id)}
                            className="text-xs text-blue-600 hover:underline px-2 py-1"
                            disabled={markAsRead.isPending}
                          >
                            Okundu
                          </button>
                        )}
                        {notification.link && (
                          <Link
                            to={notification.link}
                            className="text-xs text-blue-600 hover:underline px-2 py-1"
                          >
                            Görüntüle
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm('Bu bildirimi silmek istediğinize emin misiniz?')) {
                              deleteNotification.mutate(notification.id);
                            }
                          }}
                          className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                          disabled={deleteNotification.isPending}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {pagination.total} bildirim
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
        </Card.Body>
      </Card>
    </div>
  );
};

export default NotificationsPage;