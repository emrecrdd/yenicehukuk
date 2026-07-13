// 📁 client/src/features/tasks/task.query.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import taskApi from './task.api.js';
import toast from 'react-hot-toast';

// ============ QUERIES ============
export const useTasks = (params = {}) => {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskApi.getAll(params),
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true,
  });
};

export const useTask = (id) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => taskApi.getOne(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useTaskStatistics = () => {
  return useQuery({
    queryKey: ['task-statistics'],
    queryFn: () => taskApi.getStatistics(),
    staleTime: 5 * 60 * 1000,
  });
};

// ============ CREATE ============
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => taskApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('✅ Görev oluşturuldu');
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hata oluştu');
    },
  });
};

// ============ UPDATE ============
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => taskApi.update(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      toast.success('✏️ Görev güncellendi');
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || 'Görev güncellenemedi');
    },
  });
};

// ============ DELETE ============
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => taskApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('🗑️ Görev silindi');
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || 'Görev silinemedi');
    },
  });
};

// ============ ASSIGN ============
export const useAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignedTo }) => taskApi.assign(id, assignedTo),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('📋 Görev atandı');
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || 'Atama başarısız');
    },
  });
};

// ============ ACCEPT ============
export const useAcceptTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => taskApi.accept(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('✅ Görev kabul edildi');
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || 'Kabul başarısız');
    },
  });
};

// ============ REJECT ============
export const useRejectTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => taskApi.reject(id, reason),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('❌ Görev reddedildi');
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || 'Red başarısız');
    },
  });
};

// ============ COMPLETE ============
export const useCompleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => taskApi.complete(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('🎉 Görev tamamlandı');
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tamamlama başarısız');
    },
  });
};

// ============ PROGRESS ============
export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, progress }) =>
      taskApi.updateProgress(id, progress),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || 'Güncelleme başarısız');
    },
  });
};

// ============ REASSIGN ============
export const useReassignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignedTo }) =>
      taskApi.reassign(id, assignedTo),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('🔄 Görev yeniden atandı');
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || 'Yeniden atama başarısız');
    },
  });
};