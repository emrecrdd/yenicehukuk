import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import taskApi from './task.api.js';
import toast from 'react-hot-toast';

// ======================================================
// QUERY KEYS
// ======================================================

export const TASK_QUERY_KEYS = {
  all: ['tasks'],
  list: (params = {}) => ['tasks', params],
  detail: (id) => ['task', id],
  myTasks: (params = {}) => ['my-tasks', params],
  overdue: () => ['my-overdue-tasks'],
  upcoming: () => ['my-upcoming-tasks'],
  statistics: () => ['task-statistics'],
  notes: (id) => ['task-notes', id],
  infinite: (params = {}) => ['tasks-infinite', params],
  search: (query, params = {}) => ['tasks-search', query, params],
};

// ======================================================
// CACHE
// ======================================================

const CACHE = {
  SHORT: 2 * 60 * 1000, // 2 dakika
  NORMAL: 5 * 60 * 1000, // 5 dakika
  LONG: 10 * 60 * 1000, // 10 dakika
  GC: 10 * 60 * 1000, // 10 dakika
  GC_LONG: 30 * 60 * 1000, // 30 dakika
};

// ======================================================
// INVALIDATE HELPERS
// ======================================================

const invalidateTaskLists = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['tasks'] });
  queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
};

const invalidateTask = (queryClient, id) => {
  queryClient.invalidateQueries({ queryKey: ['task', id] });
};

const invalidateTaskNotes = (queryClient, id) => {
  queryClient.invalidateQueries({ queryKey: ['task-notes', id] });
};

// ======================================================
// TOAST HELPERS
// ======================================================

const success = (message) => toast.success(message);
const failure = (error, fallback) => {
  toast.error(error.response?.data?.message || fallback);
};

// ======================================================
// QUERIES
// ======================================================

export const useTasks = (params = {}) => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.list(params),
    queryFn: () => taskApi.getAll(params),
    staleTime: CACHE.NORMAL,
    keepPreviousData: true,
  });
};

export const useTask = (id) => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.detail(id),
    queryFn: () => taskApi.getOne(id),
    enabled: !!id,
    staleTime: CACHE.NORMAL,
  });
};

export const useMyTasks = (params = {}) => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.myTasks(params),
    queryFn: () => taskApi.getMyTasks(params),
    staleTime: CACHE.NORMAL,
  });
};

export const useMyOverdueTasks = () => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.overdue(),
    queryFn: () => taskApi.getMyOverdue(),
    staleTime: CACHE.NORMAL,
  });
};

export const useMyUpcomingTasks = () => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.upcoming(),
    queryFn: () => taskApi.getMyUpcoming(),
    staleTime: CACHE.NORMAL,
  });
};

export const useTaskStatistics = () => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.statistics(),
    queryFn: () => taskApi.getStatistics(),
    staleTime: CACHE.LONG,
  });
};

export const useTaskNotes = (taskId) => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.notes(taskId),
    queryFn: () => taskApi.getNotes(taskId),
    enabled: !!taskId,
    staleTime: CACHE.SHORT,
  });
};

// ======================================================
// MUTATIONS
// ======================================================

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.create,
    onSuccess: () => {
      invalidateTaskLists(queryClient);
      success('Görev başarıyla oluşturuldu');
    },
    onError: (error) => {
      failure(error, 'Görev oluşturulamadı');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => taskApi.update(id, data),
    onSuccess: (_, { id }) => {
      invalidateTaskLists(queryClient);
      invalidateTask(queryClient, id);
      success('Görev başarıyla güncellendi');
    },
    onError: (error) => {
      failure(error, 'Görev güncellenemedi');
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.delete,
    onSuccess: () => {
      invalidateTaskLists(queryClient);
      success('Görev başarıyla silindi');
    },
    onError: (error) => {
      failure(error, 'Görev silinemedi');
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => taskApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      invalidateTaskLists(queryClient);
      invalidateTask(queryClient, id);
      success('Görev durumu güncellendi');
    },
    onError: (error) => {
      failure(error, 'Durum güncellenemedi');
    },
  });
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assigned_to }) => taskApi.assignTask(id, assigned_to),
    onSuccess: (_, { id }) => {
      invalidateTaskLists(queryClient);
      invalidateTask(queryClient, id);
      success('Görev başarıyla atandı');
    },
    onError: (error) => {
      failure(error, 'Görev atanamadı');
    },
  });
};

export const useStartTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.startTask,
    onSuccess: (_, id) => {
      invalidateTaskLists(queryClient);
      invalidateTask(queryClient, id);
      success('Görev başlatıldı!');
    },
    onError: (error) => {
      failure(error, 'Görev başlatılamadı');
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note, actual_hours }) =>
      taskApi.completeTask(id, { note, actual_hours }),
    onSuccess: (_, { id }) => {
      invalidateTaskLists(queryClient);
      invalidateTask(queryClient, id);
      invalidateTaskNotes(queryClient, id);
      success('Görev tamamlandı! Onay bekleniyor.');
    },
    onError: (error) => {
      failure(error, 'Görev tamamlanamadı');
    },
  });
};

export const useApproveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.approveTask,
    onSuccess: (_, id) => {
      invalidateTaskLists(queryClient);
      invalidateTask(queryClient, id);
      invalidateTaskNotes(queryClient, id);
      success('Görev onaylandı! 🎉');
    },
    onError: (error) => {
      failure(error, 'Görev onaylanamadı');
    },
  });
};

export const useAddNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }) => taskApi.addNote(id, content),
    onSuccess: (_, { id }) => {
      invalidateTaskNotes(queryClient, id);
      success('Not eklendi');
    },
    onError: (error) => {
      failure(error, 'Not eklenemedi');
    },
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, progress }) => taskApi.updateProgress(id, progress),
    onSuccess: (_, { id }) => {
      invalidateTask(queryClient, id);
      invalidateTaskLists(queryClient);
      success('İlerleme güncellendi');
    },
    onError: (error) => {
      failure(error, 'İlerleme güncellenemedi');
    },
  });
};

export const useBulkUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }) =>
      Promise.all(ids.map((id) => taskApi.updateStatus(id, status))),
    onSuccess: (_, { ids }) => {
      invalidateTaskLists(queryClient);
      success(`${ids.length} görevin durumu güncellendi`);
    },
    onError: (error) => {
      failure(error, 'Toplu güncelleme başarısız');
    },
  });
};

// ======================================================
// INFINITE QUERY
// ======================================================

export const useInfiniteTasks = (params = {}) => {
  return useInfiniteQuery({
    queryKey: TASK_QUERY_KEYS.infinite(params),
    queryFn: ({ pageParam = 1 }) =>
      taskApi.getAll({
        ...params,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination) return undefined;
      return pagination.page < pagination.totalPages
        ? pagination.page + 1
        : undefined;
    },
    staleTime: CACHE.NORMAL,
    gcTime: CACHE.GC,
  });
};

// ======================================================
// PREFETCH
// ======================================================

export const prefetchTask = (queryClient, id) =>
  queryClient.prefetchQuery({
    queryKey: TASK_QUERY_KEYS.detail(id),
    queryFn: () => taskApi.getOne(id),
    staleTime: CACHE.NORMAL,
  });

export const prefetchTasks = (queryClient, params = {}) =>
  queryClient.prefetchQuery({
    queryKey: TASK_QUERY_KEYS.list(params),
    queryFn: () => taskApi.getAll(params),
    staleTime: CACHE.NORMAL,
  });

// ======================================================
// CACHE HELPERS
// ======================================================

export const updateTaskCache = (queryClient, id, updater) => {
  queryClient.setQueryData(TASK_QUERY_KEYS.detail(id), (oldData) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      data: updater(oldData.data),
    };
  });
};

export const updateTasksCache = (queryClient, params, updater) => {
  queryClient.setQueryData(TASK_QUERY_KEYS.list(params), (oldData) => {
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
  queryClient.removeQueries({
    queryKey: TASK_QUERY_KEYS.detail(id),
  });
};

// ======================================================
// SEARCH
// ======================================================

export const useSearchTasks = (query, params = {}) => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.search(query, params),
    queryFn: () =>
      taskApi.getAll({
        ...params,
        search: query,
      }),
    enabled: !!query && query.length >= 2,
    staleTime: CACHE.NORMAL,
    gcTime: CACHE.GC,
  });
};

// ======================================================
// EXPORT
// ======================================================

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