import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import clientApi from './client.api.js';
import toast from 'react-hot-toast';

// ======================================================
// QUERY KEYS
// ======================================================

export const CLIENT_QUERY_KEYS = {
  all: ['clients'],
  list: (params = {}) => ['clients', params],
  detail: (id) => ['client', id],
  statistics: () => ['client-statistics'],
  caseHistory: (clientId) => ['client-case-history', clientId],
  payments: (clientId) => ['client-payments', clientId],
  notes: (clientId) => ['client-notes', clientId],
  financialSummary: (clientId) => ['client-financial-summary', clientId],
  infinite: (params = {}) => ['clients-infinite', params],
  search: (query, params = {}) => ['clients-search', query, params],
};

// ======================================================
// CACHE
// ======================================================

const CACHE = {
  NORMAL: 5 * 60 * 1000,
  LONG: 10 * 60 * 1000,
  GC: 10 * 60 * 1000,
};

// ======================================================
// QUERIES
// ======================================================

export const useClients = (params = {}) => {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.list(params),
    queryFn: () => clientApi.getAll(params),
    staleTime: CACHE.NORMAL,
    gcTime: CACHE.GC,
    placeholderData: (previousData) => previousData,
  });
};

export const useClient = (id) => {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.detail(id),
    queryFn: () => clientApi.getOne(id),
    enabled: !!id,
    staleTime: CACHE.NORMAL,
    gcTime: CACHE.GC,
  });
};

export const useClientStatistics = () => {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.statistics(),
    queryFn: () => clientApi.getStatistics(),
    staleTime: CACHE.LONG,
    gcTime: CACHE.GC,
  });
};

export const useClientCaseHistory = (clientId) => {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.caseHistory(clientId),
    queryFn: () => clientApi.getCaseHistory(clientId),
    enabled: !!clientId,
    staleTime: CACHE.NORMAL,
    gcTime: CACHE.GC,
  });
};

export const useClientPayments = (clientId) => {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.payments(clientId),
    queryFn: () => clientApi.getPayments(clientId),
    enabled: !!clientId,
    staleTime: CACHE.NORMAL,
    gcTime: CACHE.GC,
  });
};

export const useClientNotes = (clientId) => {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.notes(clientId),
    queryFn: () => clientApi.getNotes(clientId),
    enabled: !!clientId,
    staleTime: CACHE.NORMAL,
    gcTime: CACHE.GC,
  });
};

export const useClientFinancialSummary = (clientId) => {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.financialSummary(clientId),
    queryFn: () => clientApi.getFinancialSummary(clientId),
    enabled: !!clientId,
    staleTime: CACHE.LONG,
    gcTime: CACHE.GC,
  });
};

// ======================================================
// MUTATIONS
// ======================================================

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => clientApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.statistics() });
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
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.statistics() });
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
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.statistics() });
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
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.detail(variables.id) });
      toast.success('Müvekkil durumu güncellendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Durum güncellenemedi');
    },
  });
};

// ======================================================
// BULK OPERATIONS
// ======================================================

export const useBulkDeleteClients = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids) => {
      return Promise.all(ids.map(id => clientApi.delete(id)));
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.statistics() });
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
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all });
      toast.success(`${variables.ids.length} müvekkilin durumu güncellendi`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Toplu güncelleme başarısız');
    },
  });
};

// ======================================================
// INFINITE QUERIES
// ======================================================

export const useInfiniteClients = (params = {}) => {
  return useInfiniteQuery({
    queryKey: CLIENT_QUERY_KEYS.infinite(params),
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
    staleTime: CACHE.NORMAL,
    gcTime: CACHE.GC,
    initialPageParam: 1,
  });
};

// ======================================================
// PREFETCHING
// ======================================================

export const prefetchClient = (queryClient, id) => {
  return queryClient.prefetchQuery({
    queryKey: CLIENT_QUERY_KEYS.detail(id),
    queryFn: () => clientApi.getOne(id),
    staleTime: CACHE.NORMAL,
  });
};

export const prefetchClients = (queryClient, params = {}) => {
  return queryClient.prefetchQuery({
    queryKey: CLIENT_QUERY_KEYS.list(params),
    queryFn: () => clientApi.getAll(params),
    staleTime: CACHE.NORMAL,
  });
};

// ======================================================
// CACHE HELPERS
// ======================================================

export const updateClientCache = (queryClient, id, updater) => {
  queryClient.setQueryData(CLIENT_QUERY_KEYS.detail(id), (oldData) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      data: updater(oldData.data),
    };
  });
};

export const updateClientsCache = (queryClient, params, updater) => {
  queryClient.setQueryData(CLIENT_QUERY_KEYS.list(params), (oldData) => {
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
  queryClient.removeQueries({
    queryKey: CLIENT_QUERY_KEYS.detail(id),
  });
};

// ======================================================
// SEARCH
// ======================================================

export const useSearchClients = (query, params = {}) => {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.search(query, params),
    queryFn: () => clientApi.getAll({ ...params, search: query }),
    enabled: !!query && query.length >= 2,
    staleTime: CACHE.NORMAL,
    gcTime: CACHE.GC,
  });
};