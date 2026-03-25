import axios from 'axios';
import type { ApiErrorResponse } from '../shared/types';

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const msg = error.response?.data?.message;
    if (!msg) return fallback;
    return Array.isArray(msg) ? msg[0] : msg;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
