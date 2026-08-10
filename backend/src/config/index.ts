import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export interface AppConfig {
  appName: string;
  version: string;
  description: string;
  port: number;
  nodeEnv: string;
  frontendUrl: string;
}

export const loadConfig = (): AppConfig => {
  return {
    appName: process.env.APP_NAME || 'Snake Cloud Backend',
    version: process.env.APP_VERSION || '1.0.0',
    description: process.env.APP_DESCRIPTION || 'Backend service for the Snake Cloud project',
    port: Number(process.env.PORT || process.env.APP_PORT || 4000),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  };
};
