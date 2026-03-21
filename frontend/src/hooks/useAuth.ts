import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService, type LoginPayload, type RegisterPayload } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';

export const AUTH_QUERY_KEY = ['auth', 'me'] as const;

/** Mantém o estado do usuário logado em sincronismo com o servidor */
export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authService.me,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (user) => {
      setAuth(user);
      navigate('/', { replace: true });
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (user) => {
      setAuth(user);
      navigate('/', { replace: true });
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      logout();
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
}
