export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Score {
  id: number;
  userId: number;
  score: number;
  level: number;
  createdAt: string;
}

export interface LeaderboardItem {
  rank: number;
  username: string;
  score: number;
  level: number;
  createdAt: string;
}

export interface GameSession {
  id: number;
  userId: number;
  score: number;
  level: number;
  duration: number;
  startedAt: string;
  endedAt: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  requirement: number;
  createdAt: string;
  unlockedAt: string | null;
}
