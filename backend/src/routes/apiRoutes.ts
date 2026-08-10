import { Router } from 'express';
import { getHealth, getHealthDb } from '../controllers/healthController';
import { getVersion } from '../controllers/versionController';
import { getInfo } from '../controllers/infoController';
import { scoreRouter } from './scoreRoutes';
import { gameSessionRouter } from './gameSessionRoutes';
import { achievementRouter } from './achievementRoutes';
import { authRouter } from './authRoutes';
import { adminRouter } from './adminRoutes';

export const apiRouter = Router();

apiRouter.get('/health', getHealth);
apiRouter.get('/health/db', getHealthDb);
apiRouter.get('/version', getVersion);
apiRouter.get('/info', getInfo);
apiRouter.use('/auth', authRouter);
apiRouter.use('/scores', scoreRouter);
apiRouter.use('/game/sessions', gameSessionRouter);
apiRouter.use('/achievements', achievementRouter);
apiRouter.use('/admin', adminRouter);
