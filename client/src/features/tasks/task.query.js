import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import taskApi from './task.api.js';
import toast from 'react-hot-toast';

// ============ QUERIES ============

export const useTasks = (params = {}) => {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskApi.getAll(params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
  });
};

export const useTask = (id) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => taskApi.getOne(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useMyTasks = (params = {}) => {
  return useQuery({
    queryKey: ['my-tasks', params],
    queryFn: () => taskApi.getMyTasks(params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useMyOverdueTasks = () => {
  return useQuery({
    queryKey: ['my-overdue-tasks'],
    queryFn: () => taskApi.getMyOverdue(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useMyUpcomingTasks = () => {
  return useQuery({
    queryKey: ['my-upcoming-tasks'],
    queryFn: () => taskApi.getMyUpcoming(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useTaskStatistics = () => {
  return useQuery({
    queryKey: ['task-statistics'],
    queryFn: () => taskApi.getStatistics(),
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
};

// ✅ YENİ: Notları Getir
export const useTaskNotes = (taskId) => {
  return useQuery({
    queryKey: ['task-notes', taskId],
    queryFn: () => taskApi.getNotes(taskId),
    enabled: !!taskId,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};

// ============ MUTATIONS ============

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['my-tasks']);
      toast.success('Görev başarıyla oluşturuldu');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Görev oluşturulamadı');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => taskApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['task', variables.id]);
      queryClient.invalidateQueries(['my-tasks']);
      toast.success('Görev başarıyla güncellendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Görev güncellenemedi');
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['my-tasks']);
      toast.success('Görev başarıyla silindi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Görev silinemedi');
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => taskApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['task', variables.id]);
      queryClient.invalidateQueries(['my-tasks']);
      toast.success('Görev durumu güncellendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Durum güncellenemedi');
    },
  });
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assigned_to }) => taskApi.assignTask(id, assigned_to),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['task', variables.id]);
      queryClient.invalidateQueries(['my-tasks']);
      toast.success('Görev başarıyla atandı');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Görev atanamadı');
    },
  });
};

// ✅ YENİ: Görevi Başlat
export const useStartTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => taskApi.startTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['task', id]);
      queryClient.invalidateQueries(['my-tasks']);
      toast.success('Görev başlatıldı!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Görev başlatılamadı');
    },
  });
};

// ✅ YENİ: Görevi Tamamla
export const useCompleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note, actual_hours }) => 
      taskApi.completeTask(id, { note, actual_hours }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['task', variables.id]);
      queryClient.invalidateQueries(['my-tasks']);
      queryClient.invalidateQueries(['task-notes', variables.id]);
      toast.success('Görev tamamlandı! Onay bekleniyor.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Görev tamamlanamadı');
    },
  });
};

// ✅ YENİ: Görevi Onayla (admin)
export const useApproveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => taskApi.approveTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['task', id]);
      queryClient.invalidateQueries(['my-tasks']);
      queryClient.invalidateQueries(['task-notes', id]);
      toast.success('Görev onaylandı! 🎉');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Görev onaylanamadı');
    },
  });
};

// ✅ YENİ: Not Ekle
export const useAddNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }) => taskApi.addNote(id, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['task-notes', variables.id]);
      toast.success('Not eklendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Not eklenemedi');
    },
  });
};

// ✅ YENİ: İlerleme Güncelle
export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, progress }) => taskApi.updateProgress(id, progress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['task', variables.id]);
      queryClient.invalidateQueries(['tasks']);
      toast.success('İlerleme güncellendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'İlerleme güncellenemedi');
    },
  });
};

// ============ BULK OPERATIONS ============

export const useBulkUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }) => {
      return Promise.all(ids.map(id => taskApi.updateStatus(id, status)));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['my-tasks']);
      toast.success(`${variables.ids.length} görevin durumu güncellendi`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Toplu güncelleme başarısız');
    },
  });
};

// ============ INFINITE QUERIES ============

export const useInfiniteTasks = (params = {}) => {
  return useInfiniteQuery({
    queryKey: ['tasks-infinite', params],
    queryFn: ({ pageParam = 1 }) => {
      return taskApi.getAll({ ...params, page: pageParam });
    },
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage.data;
      if (pagination.page < pagination.totalPages) {
        return pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// ============ PREFETCHING ============

export const prefetchTask = (queryClient, id) => {
  return queryClient.prefetchQuery({
    queryKey: ['task', id],
    queryFn: () => taskApi.getOne(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const prefetchTasks = (queryClient, params = {}) => {
  return queryClient.prefetchQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskApi.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
};

// ============ CACHE HELPERS ============

export const updateTaskCache = (queryClient, id, updater) => {
  queryClient.setQueryData(['task', id], (oldData) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      data: updater(oldData.data),
    };
  });
};

export const updateTasksCache = (queryClient, params, updater) => {
  queryClient.setQueryData(['tasks', params], (oldData) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      data: {
        ...oldData.data,
        data: oldData.data.data.map(updater),
      },
    };
  });
};

export const removeTaskFromCache = (queryClient, id) => {
  queryClient.removeQueries(['task', id]);
};

// ============ SEARCH ============

export const useSearchTasks = (query, params = {}) => {
  return useQuery({
    queryKey: ['tasks-search', query, params],
    queryFn: () => taskApi.getAll({ ...params, search: query }),
    enabled: query && query.length >= 2,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export default {
  useTasks,
  useTask,
  useMyTasks,
  useMyOverdueTasks,
  useMyUpcomingTasks,
  useTaskStatistics,
  useTaskNotes,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useUpdateTaskStatus,
  useAssignTask,
  useStartTask,
  useCompleteTask,
  useApproveTask,
  useAddNote,
  useUpdateProgress,
  useBulkUpdateTaskStatus,
  useInfiniteTasks,
  useSearchTasks,
  prefetchTask,
  prefetchTasks,
  updateTaskCache,
  updateTasksCache,
  removeTaskFromCache,
};