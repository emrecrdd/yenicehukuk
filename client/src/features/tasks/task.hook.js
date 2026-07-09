import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import taskApi from './task.api.js';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth.js';

// ============ TASK MANAGEMENT HOOKS ============

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

// ============ MY TASKS HOOK ============

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
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useMyUpcomingTasks = () => {
  return useQuery({
    queryKey: ['my-upcoming-tasks'],
    queryFn: () => taskApi.getMyUpcoming(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};

// ============ TASK MUTATIONS ============

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => taskApi.create(data),
    onSuccess: (response) => {
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

// ============ TASK STATUS HOOKS ============

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => taskApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['task', variables.id]);
      queryClient.invalidateQueries(['my-tasks']);
      queryClient.invalidateQueries(['my-overdue-tasks']);
      queryClient.invalidateQueries(['my-upcoming-tasks']);
      toast.success('Görev durumu güncellendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Durum güncellenemedi');
    },
  });
};

export const useTaskStatusOptions = () => {
  return [
    { value: 'pending', label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'in_progress', label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'İptal', color: 'bg-red-100 text-red-800' },
  ];
};

export const getStatusBadgeVariant = (status) => {
  const variants = {
    pending: 'warning',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'danger',
  };
  return variants[status] || 'default';
};

// ============ TASK ASSIGNMENT HOOKS ============

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

// ============ TASK STATISTICS ============

export const useTaskStatistics = () => {
  return useQuery({
    queryKey: ['task-statistics'],
    queryFn: () => taskApi.getStatistics(),
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
};

// ============ TASK FILTERING ============

export const useFilteredTasks = (tasks, filters) => {
  return useMemo(() => {
    if (!tasks) return [];

    let filtered = [...tasks];

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search)
      );
    }

    if (filters.assigned_to) {
      filtered = filtered.filter(task => task.assigned_to === filters.assigned_to);
    }

    if (filters.case_id) {
      filtered = filtered.filter(task => task.case_id === filters.case_id);
    }

    return filtered;
  }, [tasks, filters]);
};

// ============ TASK SUMMARY ============

export const useTaskSummary = (tasks) => {
  return useMemo(() => {
    if (!tasks) {
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        overdue: 0,
        byPriority: { low: 0, normal: 0, high: 0, critical: 0 },
      };
    }

    const now = new Date();
    const summary = {
      total: tasks.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0,
      byPriority: { low: 0, normal: 0, high: 0, critical: 0 },
    };

    tasks.forEach((task) => {
      // Status counts
      summary[task.status] = (summary[task.status] || 0) + 1;

      // Priority counts
      if (task.priority) {
        summary.byPriority[task.priority] = (summary.byPriority[task.priority] || 0) + 1;
      }

      // Overdue check
      if (
        task.due_date &&
        new Date(task.due_date) < now &&
        task.status !== 'completed' &&
        task.status !== 'cancelled'
      ) {
        summary.overdue++;
      }
    });

    return summary;
  }, [tasks]);
};

export default {
  useTaskFilters,
  useMyTasks,
  useMyOverdueTasks,
  useMyUpcomingTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useUpdateTaskStatus,
  useTaskStatusOptions,
  getStatusBadgeVariant,
  useAssignTask,
  useTaskStatistics,
  useFilteredTasks,
  useTaskSummary,
};