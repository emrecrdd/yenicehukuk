import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import caseApi from './case.api.js';
import toast from 'react-hot-toast';

// ======================================================
// QUERY KEYS
// ======================================================

export const CASE_QUERY_KEYS = {
  all: ['cases'],
  list: (params = {}) => ['cases', params],
  detail: (id) => ['case', id],
  statistics: () => ['case-statistics'],
  parties: (caseId) => ['case-parties', caseId],
  documents: (caseId) => ['case-documents', caseId],
  tasks: (caseId) => ['case-tasks', caseId],
  events: (caseId) => ['case-events', caseId],
  payments: (caseId) => ['case-payments', caseId],
  notes: (caseId) => ['case-notes', caseId],
  infinite: (params = {}) => ['cases-infinite', params],
  search: (query, params = {}) => ['cases-search', query, params],
};

// ======================================================
// CACHE
// ======================================================

const CACHE = {
  NORMAL: 5 * 60 * 1000,
  LONG: 10 * 60 * 1000,
  GC: 10 * 60 * 1000,
  GC_LONG: 30 * 60 * 1000,
};

// ======================================================
// QUERIES
// ======================================================

export const useCases = (params = {}) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.list(params),
    queryFn: () => caseApi.getAll(params),
    staleTime: CACHE.NORMAL,
    keepPreviousData: true,
  });
};

export const useCase = (id) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.detail(id),
    queryFn: () => caseApi.getOne(id),
    enabled: !!id,
    staleTime: CACHE.NORMAL,
  });
};

export const useCaseStatistics = () => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.statistics(),
    queryFn: () => caseApi.getStatistics(),
    staleTime: CACHE.LONG,
  });
};

export const useCaseParties = (caseId) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.parties(caseId),
    queryFn: () => caseApi.getParties(caseId),
    enabled: !!caseId,
    staleTime: CACHE.NORMAL,
  });
};

export const useCaseDocuments = (caseId) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.documents(caseId),
    queryFn: () => caseApi.getDocuments(caseId),
    enabled: !!caseId,
    staleTime: CACHE.NORMAL,
  });
};

export const useCaseTasks = (caseId) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.tasks(caseId),
    queryFn: () => caseApi.getTasks(caseId),
    enabled: !!caseId,
    staleTime: CACHE.NORMAL,
  });
};

export const useCaseEvents = (caseId) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.events(caseId),
    queryFn: () => caseApi.getEvents(caseId),
    enabled: !!caseId,
    staleTime: CACHE.NORMAL,
  });
};

export const useCasePayments = (caseId) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.payments(caseId),
    queryFn: () => caseApi.getPayments(caseId),
    enabled: !!caseId,
    staleTime: CACHE.NORMAL,
  });
};

export const useCaseNotes = (caseId) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.notes(caseId),
    queryFn: () => caseApi.getNotes(caseId),
    enabled: !!caseId,
    staleTime: CACHE.NORMAL,
  });
};

// ======================================================
// MUTATIONS
// ======================================================

export const useCreateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => caseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('Dava başarıyla oluşturuldu');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Dava oluşturulamadı');
    },
  });
};

export const useUpdateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => caseApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case', variables.id] });
      toast.success('Dava başarıyla güncellendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Dava güncellenemedi');
    },
  });
};

export const useDeleteCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => caseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('Dava başarıyla silindi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Dava silinemedi');
    },
  });
};

export const useUpdateCaseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => caseApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case', variables.id] });
      toast.success('Dava durumu güncellendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Durum güncellenemedi');
    },
  });
};

// ======================================================
// PARTY MUTATIONS
// ======================================================

export const useAddCaseParty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, data }) => caseApi.addParty(caseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case-parties', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
      toast.success('Taraf başarıyla eklendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Taraf eklenemedi');
    },
  });
};

export const useRemoveCaseParty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, partyId }) => caseApi.removeParty(caseId, partyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case-parties', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
      toast.success('Taraf başarıyla kaldırıldı');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Taraf kaldırılamadı');
    },
  });
};

// ======================================================
// BULK OPERATIONS
// ======================================================

export const useBulkUpdateCaseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }) => {
      return Promise.all(ids.map(id => caseApi.updateStatus(id, status)));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      variables.ids.forEach(id => {
        queryClient.invalidateQueries({ queryKey: ['case', id] });
      });
      toast.success(`${variables.ids.length} davanın durumu güncellendi`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Toplu güncelleme başarısız');
    },
  });
};

// ======================================================
// INFINITE QUERIES
// ======================================================

export const useInfiniteCases = (params = {}) => {
  return useInfiniteQuery({
    queryKey: CASE_QUERY_KEYS.infinite(params),
    queryFn: ({ pageParam = 1 }) => {
      return caseApi.getAll({ ...params, page: pageParam });
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

export const prefetchCase = (queryClient, id) => {
  return queryClient.prefetchQuery({
    queryKey: CASE_QUERY_KEYS.detail(id),
    queryFn: () => caseApi.getOne(id),
    staleTime: CACHE.NORMAL,
  });
};

export const prefetchCases = (queryClient, params = {}) => {
  return queryClient.prefetchQuery({
    queryKey: CASE_QUERY_KEYS.list(params),
    queryFn: () => caseApi.getAll(params),
    staleTime: CACHE.NORMAL,
  });
};

// ======================================================
// CACHE HELPERS
// ======================================================

export const updateCaseCache = (queryClient, id, updater) => {
  queryClient.setQueryData(CASE_QUERY_KEYS.detail(id), (oldData) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      data: updater(oldData.data),
    };
  });
};

export const updateCasesCache = (queryClient, params, updater) => {
  queryClient.setQueryData(CASE_QUERY_KEYS.list(params), (oldData) => {
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

export const removeCaseFromCache = (queryClient, id) => {
  queryClient.removeQueries({
    queryKey: CASE_QUERY_KEYS.detail(id),
  });
};

// ======================================================
// SEARCH
// ======================================================

export const useSearchCases = (query, params = {}) => {
  return useQuery({
    queryKey: CASE_QUERY_KEYS.search(query, params),
    queryFn: () => caseApi.getAll({ ...params, search: query }),
    enabled: !!query && query.length >= 2,
    staleTime: CACHE.NORMAL,
    gcTime: CACHE.GC,
  });
};

// ======================================================
// EXPORT
// ======================================================

export default {
  // Queries
  useCases,
  useCase,
  useCaseStatistics,
  useCaseParties,
  useCaseDocuments,
  useCaseTasks,
  useCaseEvents,
  useCasePayments,
  useCaseNotes,
  useSearchCases,
  useInfiniteCases,

  // Mutations
  useCreateCase,
  useUpdateCase,
  useDeleteCase,
  useUpdateCaseStatus,
  useAddCaseParty,
  useRemoveCaseParty,
  useBulkUpdateCaseStatus,

  // Helpers
  prefetchCase,
  prefetchCases,
  updateCaseCache,
  updateCasesCache,
  removeCaseFromCache,
};