import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import documentApi from './document.api.js';
import toast from 'react-hot-toast';

// ============ QUERIES ============

export const useDocuments = (params = {}) => {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentApi.getAll(params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
  });
};

export const useDocument = (id) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => documentApi.getOne(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useDocumentCategories = () => {
  return useQuery({
    queryKey: ['document-categories'],
    queryFn: () => documentApi.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useDocumentStatistics = () => {
  return useQuery({
    queryKey: ['document-statistics'],
    queryFn: () => documentApi.getStatistics(),
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
};

export const useDocumentVersions = (documentId) => {
  return useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: () => documentApi.getVersions(documentId),
    enabled: !!documentId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============ MUTATIONS ============

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => documentApi.upload(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['documents']);
      queryClient.invalidateQueries(['document-statistics']);
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
      queryClient.invalidateQueries(['documents']);
      queryClient.invalidateQueries(['document', variables.id]);
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
      queryClient.invalidateQueries(['documents']);
      queryClient.invalidateQueries(['document-statistics']);
      toast.success('Belge başarıyla silindi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Belge silinemedi');
    },
  });
};

// ============ BULK OPERATIONS ============

export const useBulkDeleteDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids) => {
      return Promise.all(ids.map(id => documentApi.delete(id)));
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries(['documents']);
      queryClient.invalidateQueries(['document-statistics']);
      toast.success(`${ids.length} belge başarıyla silindi`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Toplu silme başarısız');
    },
  });
};

// ============ INFINITE QUERIES ============

export const useInfiniteDocuments = (params = {}) => {
  return useInfiniteQuery({
    queryKey: ['documents-infinite', params],
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
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// ============ PREFETCHING ============

export const prefetchDocument = (queryClient, id) => {
  return queryClient.prefetchQuery({
    queryKey: ['document', id],
    queryFn: () => documentApi.getOne(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const prefetchDocuments = (queryClient, params = {}) => {
  return queryClient.prefetchQuery({
    queryKey: ['documents', params],
    queryFn: () => documentApi.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
};

// ============ CACHE HELPERS ============

export const updateDocumentCache = (queryClient, id, updater) => {
  queryClient.setQueryData(['document', id], (oldData) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      data: updater(oldData.data),
    };
  });
};

export const updateDocumentsCache = (queryClient, params, updater) => {
  queryClient.setQueryData(['documents', params], (oldData) => {
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
  queryClient.removeQueries(['document', id]);
};

// ============ SEARCH ============

export const useSearchDocuments = (query, params = {}) => {
  return useQuery({
    queryKey: ['documents-search', query, params],
    queryFn: () => documentApi.getAll({ ...params, search: query }),
    enabled: query && query.length >= 2,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export default {
  useDocuments,
  useDocument,
  useDocumentCategories,
  useDocumentStatistics,
  useDocumentVersions,
  useUploadDocument,
  useUpdateDocument,
  useDeleteDocument,
  useBulkDeleteDocuments,
  useInfiniteDocuments,
  useSearchDocuments,
  prefetchDocument,
  prefetchDocuments,
  updateDocumentCache,
  updateDocumentsCache,
  removeDocumentFromCache,
};