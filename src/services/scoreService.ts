import { apiClient } from './api';
import type { Score, LeaderboardItem } from '../types/api';

export interface CreateScorePayload {
  score: number;
  level: number;
}

export const getTopScores = async (): Promise<LeaderboardItem[]> => {
  const response = await apiClient.get<{ status: string; data: LeaderboardItem[] }>('/scores/top');
  return response.data.data;
};

export const getScoreHistory = async (page = 1, limit = 10): Promise<{ data: Score[]; meta: { total: number; page: number; limit: number } }> => {
  const response = await apiClient.get<{ status: string; data: Score[]; meta: { total: number; page: number; limit: number } }>(`/scores/history?page=${page}&limit=${limit}`);
  return response.data;
};

export const createScore = async (payload: CreateScorePayload): Promise<Score> => {
  const response = await apiClient.post<{ status: string; data: Score }>('/scores', payload);
  return response.data.data;
};
