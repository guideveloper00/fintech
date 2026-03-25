import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/store/auth.store';
import type { ApiErrorResponse } from '@/shared/types';

/**
 * withCredentials: true — faz o browser enviar o HttpOnly cookie
 * automaticamente em toda requisição cross-origin para a API.
 * O token JWT nunca é lido por JavaScript: sai do cookie, entra no cookie.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Se o cookie expirar ou for inválido, o backend retorna 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const requestUrl = error.config?.url ?? '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register');

    // Só redireciona para /login se o 401 vier de uma rota protegida,
    // não de uma tentativa de login com credenciais erradas.
    if (error.response?.status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
