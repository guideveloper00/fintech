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
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url ?? '';

      // 401 em login/register = credenciais erradas, nunca é expiração de sessão
      const isAuthAttempt =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register');

      if (!isAuthAttempt) {
        const { loginTimestamp } = useAuthStore.getState();
        const secondsSinceLogin = loginTimestamp
          ? (Date.now() - loginTimestamp) / 1000
          : Infinity;

        // Grace period de 60s após login:
        //   - Cobre cold start do Railway (~30s)
        //   - Cobre propagação de cookie cross-origin no Safari ITP / mobile
        //   - Sessão genuinamente expirada (horas de uso) → secondsSinceLogin >> 60 → desloga ✓
        if (secondsSinceLogin > 60) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);
