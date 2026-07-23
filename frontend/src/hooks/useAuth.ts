import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { usersApi } from '@/api/users';
import { useAuthStore } from '@/stores/auth.store';
import { useNavigate } from 'react-router-dom';

export function useUser() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['user'],
    queryFn: usersApi.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { login } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.login(data),
    onSuccess: (data) => {
      login(data.user, data.accessToken);
      queryClient.setQueryData(['user'], data.user);
      navigate('/today');
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (data: { email: string; password: string; displayName: string }) => authApi.signup(data),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });
}

export function useMagicLink() {
  return useMutation({
    mutationFn: (email: string) => authApi.magicLink(email),
  });
}
