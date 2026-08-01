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

export function useMembers() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['members'],
    queryFn: authApi.members,
    enabled: !isAuthenticated,
    staleTime: 60_000,
  });
}

export function useMemberLogin() {
  const queryClient = useQueryClient();
  const { login } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { memberId: string; password: string }) => authApi.memberLogin(data.memberId, data.password),
    onSuccess: (data) => {
      login(data.user, data.accessToken);
      queryClient.setQueryData(['user'], data.user);
      navigate('/today');
    },
  });
}

export function useCreateMember() {
  return useMutation({
    mutationFn: (data: { displayName: string; password: string; email?: string }) =>
      authApi.createMember(data),
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
