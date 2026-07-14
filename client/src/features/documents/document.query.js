import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import documentApi from './document.api.js';
import toast from 'react-hot-toast';

// ======================================================
// QUERY KEYS
// ======================================================

export const DOCUMENT_QUERY_KEYS = {
  all: ['documents'],
  list: (params = {}) => ['documents', params],
  detail: (id) => ['document', id],
  categories: () => ['document-categories'],
  statistics: () => ['document-statistics'],
  versions: (documentId) => ['document-versions', documentId],
  infinite: (params = {}) => ['documents-infinite', params],
  search: (query, params = {}) => ['documents-search', query, params],
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

export const useDocuments = (params = {}) => {
  return useQuery({
    queryKey: DOCUMENT_QUERY_KEYS.list(params),
    queryFn: () => documentApi.getAll(params),
    staleTime: CACHE.NORMAL,
    gcTime: CACHE.GC,
    placeholderData: (previousData) => previousData,
  });
};

export const useDocument = (id) => {
  return useQuery({
    queryKey: DOCUMENT_QUERY_KEYS.detail(id),
    queryFn: () => documentApi.getOne(id),
    enabled: !!id,
    staleTime: CACHE.NORMAL,
    gcTime: CACHE.GC,
  });
};

export const useDocumentCategories = () => {
  return useQuery({
    queryKey: DOCUMENT_QUERY_KEYS.categories(),
    queryFn: () => documentApi.getCategories(),
    staleTime: CACHE.LONG,
    gcTime: CACHE.GC,
  });
};

export const useDocumentStatistics = () => {
  return useQuery({
    queryKey: DOCUMENT_QUERY_KEYS.statistics(),
    queryFn: () => documentApi.getStatistics(),
    staleTime: CACHE.LONG,
    gcTime: CACHE.GC,
  });
};

export const useDocumentVersions = (documentId) => {
  return useQuery({
    queryKey: DOCUMENT_QUERY_KEYS.versions(documentId),
    queryFn: () => documentApi.getVersions(documentId),
    enabled: !!documentId,
    staleTime: CACHE.NORMAL,
    gcTime: CACHE.GC,
  });
};

// ======================================================
// MUTATIONS
// ======================================================

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => documentApi.upload(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.statistics() });
      toast.success('Belge başarıyla yüklendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Belge yüklenemedi');
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => documentApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.detail(variables.id) });
      toast.success('Belge başarıyla güncellendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Belge güncellenemedi');
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => documentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.statistics() });
      toast.success('Belge başarıyla silindi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Belge silinemedi');
    },
  });
};

// ======================================================
// BULK OPERATIONS
// ======================================================

export const useBulkDeleteDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids) => {
      return Promise.all(ids.map(id => documentApi.delete(id)));
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.statistics() });
      toast.success(`${ids.length} belge başarıyla silindi`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Toplu silme başarısız');
    },
  });
};

// ======================================================
// INFINITE QUERIES
// ======================================================

export const useInfiniteDocuments = (params = {}) => {
  return useInfiniteQuery({
    queryKey: DOCUMENT_QUERY_KEYS.infinite(params),
    queryFn: ({ pageParam = 1 }) => {
      return documentApi.getAll({ ...params, page: pageParam });
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

export const prefetchDocument = (queryClient, id) => {
  return queryClient.prefetchQuery({
    queryKey: DOCUMENT_QUERY_KEYS.detail(id),
    queryFn: () => documentApi.getOne(id),
    staleTime: CACHE.NORMAL,
  });
};

export const prefetchDocuments = (queryClient, params = {}) => {
  return queryClient.prefetchQuery({
    queryKey: DOCUMENT_QUERY_KEYS.list(params),
    queryFn: () => documentApi.getAll(params),
    staleTime: CACHE.NORMAL,
  });
};

// ======================================================
// CACHE HELPERS
// ======================================================

export const updateDocumentCache = (queryClient, id, updater) => {
  queryClient.setQueryData(DOCUMENT_QUERY_KEYS.detail(id), (oldData) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      data: updater(oldData.data),
    };
  });
};

export const updateDocumentsCache = (queryClient, params, updater) => {
  queryClient.setQueryData(DOCUMENT_QUERY_KEYS.list(params), (oldData) => {
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

export const removeDocumentFromCache = (queryClient, id) => {
  queryClient.removeQueries({
    queryKey: DOCUMENT_QUERY_KEYS.detail(id),
  });
};

// ======================================================
// SEARCH
// ======================================================

export const useSearchDocuments = (query, params = {}) => {
  return useQuery({
    queryKey: DOCUMENT_QUERY_KEYS.search(query, params),
    queryFn: () => documentApi.getAll({ ...params, search: query }),
    enabled: !!query && query.length >= 2,
    staleTime: CACHE.NORMAL,
    gcTime: CACHE.GC,
  });
};