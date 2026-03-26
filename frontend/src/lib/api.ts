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

    // Apenas /auth/me dispara logout automático — ele é o único endpoint
    // dedicado a verificar sessão. 401s em dashboard/transactions/categories
    // podem ser transientes (cookie cross-origin no mobile, cold start do Railway)
    // e não devem forçar logout; o TanStack Query já exibe o erro na tela.
    const isSessionCheck = requestUrl.includes('/auth/me');

    if (error.response?.status === 401 && isSessionCheck) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);
