import app from './app';
import { loadConfig } from './config';
import { logger } from './utils/logger';

const config = loadConfig();

const server = app.listen(config.port, '0.0.0.0', () => {
  logger.info(`${config.appName} listening on 0.0.0.0:${config.port}`);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason instanceof Error ? reason.message : String(reason));
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error.message);
  server.close(() => process.exit(1));
});
