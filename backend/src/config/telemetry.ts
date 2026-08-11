import dotenv from 'dotenv';
import path from 'path';
import { useAzureMonitor } from '@azure/monitor-opentelemetry';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { logger } from '../utils/logger';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const CONNECTION_STRING_ENV = 'APPLICATIONINSIGHTS_CONNECTION_STRING';

let initialized = false;

const initTelemetry = (): void => {
  if (initialized) {
    return;
  }

  const connectionString = process.env[CONNECTION_STRING_ENV];
  if (!connectionString) {
    logger.warn(`Azure Application Insights disabled: ${CONNECTION_STRING_ENV} is not set`);
    return;
  }

  try {
    useAzureMonitor({
      azureMonitorExporterOptions: { connectionString },
      enableLiveMetrics: true,
      enableStandardMetrics: true,
      enablePerformanceCounters: true,
      instrumentationOptions: {
        azureSdk: { enabled: true },
        http: { enabled: true },
        mongoDb: { enabled: false },
        mySql: { enabled: false },
        postgreSql: { enabled: false },
        redis: { enabled: false },
        redis4: { enabled: false },
        bunyan: { enabled: false },
        winston: { enabled: false },
      },
    });

    registerInstrumentations({
      instrumentations: [new ExpressInstrumentation()],
    });

    try {
      registerInstrumentations({
        instrumentations: [new PrismaInstrumentation()],
      });
    } catch (prismaError) {
      logger.warn(
        'Prisma dependency instrumentation could not be enabled',
        prismaError instanceof Error ? prismaError.message : String(prismaError),
      );
    }

    initialized = true;
    logger.info(`Azure Application Insights telemetry initialized (env: ${CONNECTION_STRING_ENV})`);
  } catch (error) {
    logger.error(
      'Failed to initialize Azure Application Insights telemetry',
      error instanceof Error ? error.message : String(error),
    );
  }
};

initTelemetry();

export default initTelemetry;
