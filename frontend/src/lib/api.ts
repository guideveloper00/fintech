import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/store/auth.store';
import type { ApiErrorResponse } from '@/shared/types';

/**
 * withCredentials: true — faz o browser enviar o HttpOnly cookie
 * automaticamente em toda requisição para a API.
 * Em produção o cookie é same-origin (proxy Vercel → Railway),
 * então funciona em todos os browsers incluindo Safari/iOS.
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
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url ?? '';

      // 401 em login/register = credenciais erradas, não expiração de sessão
      const isAuthAttempt =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register');

      if (!isAuthAttempt) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);
