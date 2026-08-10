import { apiClient } from './api';
import type { Achievement } from '../types/api';

export const getAchievements = async (): Promise<Achievement[]> => {
  const response = await apiClient.get<{ status: string; data: Achievement[] }>('/achievements');
  return response.data.data;
};

export const getMyAchievements = async (): Promise<Achievement[]> => {
  const response = await apiClient.get<{ status: string; data: Achievement[] }>('/achievements/me');
  return response.data.data;
};
