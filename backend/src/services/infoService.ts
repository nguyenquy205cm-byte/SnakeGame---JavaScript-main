import { InfoResponse } from '../types/app';
import { loadConfig } from '../config';

export const infoService = {
  getInfo: (): InfoResponse => {
    const config = loadConfig();
    return {
      appName: config.appName,
      version: config.version,
      description: config.description,
      environment: config.nodeEnv,
    };
  },
};
