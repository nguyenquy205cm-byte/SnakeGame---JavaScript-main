import { VersionResponse } from '../types/app';
import { loadConfig } from '../config';

export const versionService = {
  getVersion: (): VersionResponse => {
    const config = loadConfig();
    return {
      version: config.version,
      description: config.description,
    };
  },
};
