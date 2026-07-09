import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import caseApi from './case.api.js';
import toast from 'react-hot-toast';

// ============ QUERIES ============

export const useCases = (params = {}) => {
  return useQuery({
    queryKey: ['cases', params],
    queryFn: () => caseApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
  });
};

export const useCase = (id) => {
  return useQuery({
    queryKey: ['case', id],
    queryFn: () => caseApi.getOne(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useCaseStatistics = () => {
  return useQuery({
    queryKey: ['case-statistics'],
    queryFn: () => caseApi.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCaseParties = (caseId) => {
  return useQuery({
    queryKey: ['case-parties', caseId],
    queryFn: () => caseApi.getParties(caseId),
    enabled: !!caseId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCaseDocuments = (caseId) => {
  return useQuery({
    queryKey: ['case-documents', caseId],
    queryFn: () => caseApi.getDocuments(caseId),
    enabled: !!caseId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCaseTasks = (caseId) => {
  return useQuery({
    queryKey: ['case-tasks', caseId],
    queryFn: () => caseApi.getTasks(caseId),
    enabled: !!caseId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCaseEvents = (caseId) => {
  return useQuery({
    queryKey: ['case-events', caseId],
    queryFn: () => caseApi.getEvents(caseId),
    enabled: !!caseId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCasePayments = (caseId) => {
  return useQuery({
    queryKey: ['case-payments', caseId],
    queryFn: () => caseApi.getPayments(caseId),
    enabled: !!caseId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCaseNotes = (caseId) => {
  return useQuery({
    queryKey: ['case-notes', caseId],
    queryFn: () => caseApi.getNotes(caseId),
    enabled: !!caseId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============ MUTATIONS ============

export const useCreateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => caseApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['cases']);
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
      queryClient.invalidateQueries(['cases']);
      queryClient.invalidateQueries(['case', variables.id]);
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
      queryClient.invalidateQueries(['cases']);
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
      queryClient.invalidateQueries(['cases']);
      queryClient.invalidateQueries(['case', variables.id]);
      toast.success('Dava durumu güncellendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Durum güncellenemedi');
    },
  });
};

// ============ PARTY MUTATIONS ============

export const useAddCaseParty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, data }) => caseApi.addParty(caseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['case-parties', variables.caseId]);
      queryClient.invalidateQueries(['case', variables.caseId]);
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
      queryClient.invalidateQueries(['case-parties', variables.caseId]);
      queryClient.invalidateQueries(['case', variables.caseId]);
      toast.success('Taraf başarıyla kaldırıldı');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Taraf kaldırılamadı');
    },
  });
};

// ============ BULK OPERATIONS ============

export const useBulkUpdateCaseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }) => {
      return Promise.all(ids.map(id => caseApi.updateStatus(id, status)));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['cases']);
      variables.ids.forEach(id => {
        queryClient.invalidateQueries(['case', id]);
      });
      toast.success(`${variables.ids.length} davanın durumu güncellendi`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Toplu güncelleme başarısız');
    },
  });
};

// ============ INFINITE QUERIES ============

export const useInfiniteCases = (params = {}) => {
  return useInfiniteQuery({
    queryKey: ['cases-infinite', params],
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
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// ============ PREFETCHING ============

export const prefetchCase = (queryClient, id) => {
  return queryClient.prefetchQuery({
    queryKey: ['case', id],
    queryFn: () => caseApi.getOne(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const prefetchCases = (queryClient, params = {}) => {
  return queryClient.prefetchQuery({
    queryKey: ['cases', params],
    queryFn: () => caseApi.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
};

// ============ CACHE HELPERS ============

export const updateCaseCache = (queryClient, id, updater) => {
  queryClient.setQueryData(['case', id], (oldData) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      data: updater(oldData.data),
    };
  });
};

export const updateCasesCache = (queryClient, params, updater) => {
  queryClient.setQueryData(['cases', params], (oldData) => {
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
  queryClient.removeQueries(['case', id]);
};

// ============ SEARCH ============

export const useSearchCases = (query, params = {}) => {
  return useQuery({
    queryKey: ['cases-search', query, params],
    queryFn: () => caseApi.getAll({ ...params, search: query }),
    enabled: query && query.length >= 2,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

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