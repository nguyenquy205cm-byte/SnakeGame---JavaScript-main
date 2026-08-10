export interface ScoreRecord {
  id: number;
  userId: number;
  score: number;
  level: number;
  createdAt: string;
}

export interface CreateScorePayload {
  userId: number;
  score: number;
  level: number;
}
