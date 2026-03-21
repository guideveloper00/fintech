import { api } from '../lib/api';
import type { AuthResult } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResult> {
    const res = await api.post<{ data: AuthResult }>('/auth/login', payload);
    return res.data.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResult> {
    const res = await api.post<{ data: AuthResult }>('/auth/register', payload);
    return res.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  /** /auth/me retorna o usuário logado diretamente (sem wrapper adicional) */
  async me(): Promise<AuthResult> {
    const res = await api.get<{ data: AuthResult }>('/auth/me');
    return res.data.data;
  },
};
