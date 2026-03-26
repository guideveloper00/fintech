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

    // Endpoints de auth nunca disparam logout automático
    const skipAutoLogout =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/me');

    if (error.response?.status === 401 && !skipAutoLogout) {
      const { loginTimestamp } = useAuthStore.getState();
      const secondsSinceLogin = loginTimestamp
        ? (Date.now() - loginTimestamp) / 1000
        : Infinity;

      // Ignora 401s nos primeiros 15 segundos após login — evita race condition
      // onde queries do load inicial disparam antes do cookie se propagar,
      // especialmente em conexões lentas ou cold starts do Railway
      if (secondsSinceLogin > 15) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
