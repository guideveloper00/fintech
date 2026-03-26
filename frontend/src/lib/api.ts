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

    // Endpoints que nunca devem disparar o logout automático:
    // - /auth/login e /auth/register: credenciais erradas, não sessão expirada
    // - /auth/me: verificação silenciosa de sessão — se falhar, o Zustand
    //   já mantém o estado correto; logout aqui causaria flash em browsers
    //   que bloqueiam cookies cross-site (Safari ITP, modo incógnito)
    const skipAutoLogout =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/me');

    if (error.response?.status === 401 && !skipAutoLogout) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
