import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationApi from './notification.api.js';
import toast from 'react-hot-toast';

// ✅ Okunmamış bildirim sayısı
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notification-unread-count'],
    queryFn: () => notificationApi.getUnreadCount(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};

// ✅ Bildirim listesi
export const useNotifications = (params = {}) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationApi.getMyNotifications(params),
    staleTime: 60 * 1000,
  });
};

// ✅ Okundu işaretle
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bildirim güncellenemedi');
    },
  });
};

// ✅ Tümünü okundu işaretle
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
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
};

// ✅ Sil
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
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
};

// ✅ Tümünü sil
export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
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
};