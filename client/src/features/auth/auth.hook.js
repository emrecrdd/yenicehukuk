import { useMutation, useQuery } from '@tanstack/react-query';
import authApi from './auth.api.js';
import { useAuth } from '../../app/providers/auth.provider.jsx';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  const { register } = useAuth();

  return useMutation({
    mutationFn: (userData) => register(userData),
    onSuccess: () => {
      toast.success('Registration successful! Please login.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });
};