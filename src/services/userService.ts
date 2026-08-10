import { apiClient } from './api';
import type { User } from '../types/api';

export const userService = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<{ status: string; data: User }>('/auth/me');
    return response.data.data;
  },
};
