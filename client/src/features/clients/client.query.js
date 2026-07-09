import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clientApi from './client.api.js';
import toast from 'react-hot-toast';

// ============ QUERIES ============

export const useClients = (params = {}) => {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => clientApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
  });
};

export const useClient = (id) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => clientApi.getOne(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useClientStatistics = () => {
  return useQuery({
    queryKey: ['client-statistics'],
    queryFn: () => clientApi.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useClientCaseHistory = (clientId) => {
  return useQuery({
    queryKey: ['client-case-history', clientId],
    queryFn: () => clientApi.getCaseHistory(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useClientPayments = (clientId) => {
  return useQuery({
    queryKey: ['client-payments', clientId],
    queryFn: () => clientApi.getPayments(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useClientNotes = (clientId) => {
  return useQuery({
    queryKey: ['client-notes', clientId],
    queryFn: () => clientApi.getNotes(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useClientFinancialSummary = (clientId) => {
  return useQuery({
    queryKey: ['client-financial-summary', clientId],
    queryFn: () => clientApi.getFinancialSummary(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============ MUTATIONS ============

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => clientApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries(['client-statistics']);
      toast.success('Müvekkil başarıyla oluşturuldu');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Müvekkil oluşturulamadı');
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => clientApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries(['client', variables.id]);
      queryClient.invalidateQueries(['client-statistics']);
      toast.success('Müvekkil başarıyla güncellendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Müvekkil güncellenemedi');
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => clientApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries(['client-statistics']);
      toast.success('Müvekkil başarıyla silindi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Müvekkil silinemedi');
    },
  });
};

export const useUpdateClientStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => clientApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries(['client', variables.id]);
      toast.success('Müvekkil durumu güncellendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Durum güncellenemedi');
    },
  });
};

// ============ BULK OPERATIONS ============

export const useBulkDeleteClients = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids) => {
      return Promise.all(ids.map(id => clientApi.delete(id)));
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries(['client-statistics']);
      toast.success(`${ids.length} müvekkil başarıyla silindi`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Toplu silme başarısız');
    },
  });
};

export const useBulkUpdateClientStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }) => {
      return Promise.all(ids.map(id => clientApi.updateStatus(id, status)));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['clients']);
      toast.success(`${variables.ids.length} müvekkilin durumu güncellendi`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Toplu güncelleme başarısız');
    },
  });
};

// ============ INFINITE QUERIES ============

export const useInfiniteClients = (params = {}) => {
  return useInfiniteQuery({
    queryKey: ['clients-infinite', params],
    queryFn: ({ pageParam = 1 }) => {
      return clientApi.getAll({ ...params, page: pageParam });
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

export const prefetchClient = (queryClient, id) => {
  return queryClient.prefetchQuery({
    queryKey: ['client', id],
    queryFn: () => clientApi.getOne(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const prefetchClients = (queryClient, params = {}) => {
  return queryClient.prefetchQuery({
    queryKey: ['clients', params],
    queryFn: () => clientApi.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
};

// ============ CACHE HELPERS ============

export const updateClientCache = (queryClient, id, updater) => {
  queryClient.setQueryData(['client', id], (oldData) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      data: updater(oldData.data),
    };
  });
};

export const updateClientsCache = (queryClient, params, updater) => {
  queryClient.setQueryData(['clients', params], (oldData) => {
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

export const removeClientFromCache = (queryClient, id) => {
  queryClient.removeQueries(['client', id]);
};

// ============ SEARCH ============

export const useSearchClients = (query, params = {}) => {
  return useQuery({
    queryKey: ['clients-search', query, params],
    queryFn: () => clientApi.getAll({ ...params, search: query }),
    enabled: query && query.length >= 2,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// ============ EXPORT ============

export default {
  // Queries
  useClients,
  useClient,
  useClientStatistics,
  useClientCaseHistory,
  useClientPayments,
  useClientNotes,
  useClientFinancialSummary,
  useSearchClients,
  useInfiniteClients,

  // Mutations
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useUpdateClientStatus,
  useBulkDeleteClients,
  useBulkUpdateClientStatus,

  // Helpers
  prefetchClient,
  prefetchClients,
  updateClientCache,
  updateClientsCache,
  removeClientFromCache,
};