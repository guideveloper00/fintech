import { authService, LoginPayload, RegisterPayload } from '@/services/auth.service';
import { UpdateProfilePayload, usersService } from '@/services/users.service';
import { useAuthStore } from '@/store/auth.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (user) => {
      setAuth(user);
      // Pré-popula o cache de /auth/me para que useCurrentUser não precise
      // fazer uma requisição imediata — evita 401 em browsers que bloqueiam
      // cookies cross-site (Safari ITP, modo incógnito com 3rd-party cookies bloqueados)
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
      navigate('/', { replace: true });
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (user) => {
      setAuth(user);
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
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

export function useUpdateProfile() {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => usersService.updateProfile(payload),
    onSuccess: (updatedUser) => {
      // Atualiza o store de auth e o cache do React Query
      setAuth(updatedUser);
      queryClient.setQueryData(AUTH_QUERY_KEY, updatedUser);
    },
  });
}
