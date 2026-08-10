import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes/apiRoutes';
import { loadConfig } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { requestLogger } from './middlewares/requestLogger';

const app: Application = express();
const config = loadConfig();

const allowedOrigins = [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

app.use('/api', apiRouter);

app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: `${config.appName} is running`,
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

logger.info(`Application initialized in ${config.nodeEnv} mode`);

export default app;
