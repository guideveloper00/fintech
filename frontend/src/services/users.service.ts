import { api } from '../lib/api';
import type { User } from '../shared/types';

export interface UpdateProfilePayload {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  avatarUrl?: string | null;
}

export const usersService = {
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const res = await api.patch<{ data: User }>('/users/me', payload);
    return res.data.data;
  },
};
