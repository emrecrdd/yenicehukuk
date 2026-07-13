import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import taskApi from './task.api.js';
import toast from 'react-hot-toast';

// ============ TASK FILTERS ============
export const useTaskFilters = () => {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    assigned_to: '',
    case_id: '',
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      search: '',
      assigned_to: '',
      case_id: '',
    });
  };

  const getActiveFilters = () => {
    return Object.entries(filters).filter(([_, value]) => value !== '');
  };

  const hasActiveFilters = getActiveFilters().length > 0;

  return {
    filters,
    updateFilter,
    resetFilters,
    getActiveFilters,
    hasActiveFilters,
  };
};

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

// ============ MUTATIONS ============
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast.success('Görev başarıyla atandı');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Görev atanamadı');
    },
  });
};

// ============ PROGRESS ============
export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, progress }) => taskApi.updateProgress(id, progress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('İlerleme güncellendi');
    },
    onError: () => {
      toast.error('İlerleme güncellenemedi');
    },
  });
};

// ============ TAGS ============
export const useUpdateTags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tags }) => taskApi.updateTags(id, tags),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Etiketler güncellendi');
    },
    onError: () => {
      toast.error('Etiketler güncellenemedi');
    },
  });
};

// ============ REMINDER ============
export const useUpdateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reminder_date }) => taskApi.updateReminder(id, reminder_date),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Hatırlatma tarihi güncellendi');
    },
    onError: () => {
      toast.error('Hatırlatma tarihi güncellenemedi');
    },
  });
};

// ============ SUBTASKS ============
export const useAddSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => taskApi.addSubtask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Alt görev eklendi');
    },
    onError: () => {
      toast.error('Alt görev eklenemedi');
    },
  });
};

export const useDeleteSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, subtaskId }) => taskApi.deleteSubtask(id, subtaskId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Alt görev silindi');
    },
    onError: () => {
      toast.error('Alt görev silinemedi');
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast.success(`${variables.ids.length} görevin durumu güncellendi`);
    },
    onError: () => {
      toast.error('Toplu güncelleme başarısız');
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
  queryClient.removeQueries({ queryKey: ['task', id] });
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
  useTaskFilters,
  useTasks,
  useTask,
  useMyTasks,
  useMyOverdueTasks,
  useMyUpcomingTasks,
  useTaskStatistics,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useUpdateTaskStatus,
  useAssignTask,
  useUpdateProgress,
  useUpdateTags,
  useUpdateReminder,
  useAddSubtask,
  useDeleteSubtask,
  useBulkUpdateTaskStatus,
  useInfiniteTasks,
  useSearchTasks,
  prefetchTask,
  prefetchTasks,
  updateTaskCache,
  updateTasksCache,
  removeTaskFromCache,
};