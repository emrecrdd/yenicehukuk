import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import caseApi from './case.api.js';
import toast from 'react-hot-toast';

export const useCases = (params) => {
  return useQuery({
    queryKey: ['cases', params],
    queryFn: () => caseApi.getAll(params),
  });
};

export const useCase = (id) => {
  return useQuery({
    queryKey: ['case', id],
    queryFn: () => caseApi.getOne(id),
    enabled: !!id,
  });
};

export const useCreateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => caseApi.create(data),
    onSuccess: () => {
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