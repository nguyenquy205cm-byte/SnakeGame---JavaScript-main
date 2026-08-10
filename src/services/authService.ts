import { apiClient } from './api';
import type { User } from '../types/api';

interface AuthResponse {
  status: string;
  data: {
    user: User;
    accessToken?: string;
  };
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

const storeAccessToken = (token: string) => {
  localStorage.setItem('accessToken', token);
};

const clearAccessToken = () => {
  localStorage.removeItem('accessToken');
};

export const authService = {
  login: async (payload: LoginPayload): Promise<{ user: User; accessToken: string }> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    const result = response.data.data as { user: User; accessToken: string };
    storeAccessToken(result.accessToken);
    return result;
  },

  register: async (payload: RegisterPayload): Promise<{ user: User; accessToken: string }> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload);
    const result = response.data.data as { user: User; accessToken: string };
    storeAccessToken(result.accessToken);
    return result;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    clearAccessToken();
  },

  refresh: async (): Promise<string> => {
    const response = await apiClient.post<{ status: string; data: { accessToken: string } }>('/auth/refresh');
    const accessToken = response.data.data.accessToken;
    storeAccessToken(accessToken);
    return accessToken;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<{ status: string; data: User }>('/auth/me');
    return response.data.data;
  },
};
