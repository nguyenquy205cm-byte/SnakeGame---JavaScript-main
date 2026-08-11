import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import type { LogAttributes } from '@opentelemetry/api-logs';

const otelLogger = logs.getLogger('snake-cloud-backend');

const toAttributes = (meta: unknown): LogAttributes | undefined => {
  if (meta && typeof meta === 'object') {
    return meta as LogAttributes;
  }
  if (meta !== undefined) {
    return { message: String(meta) };
  }
  return undefined;
};

export const logger = {
  info: (message: string, meta?: unknown) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
    otelLogger.emit({
      severityNumber: SeverityNumber.INFO,
      severityText: 'INFO',
      body: message,
      attributes: toAttributes(meta),
    });
  },
  warn: (message: string, meta?: unknown) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
    otelLogger.emit({
      severityNumber: SeverityNumber.WARN,
      severityText: 'WARN',
      body: message,
      attributes: toAttributes(meta),
    });
  },
  error: (message: string, meta?: unknown) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, meta || '');
    otelLogger.emit({
      severityNumber: SeverityNumber.ERROR,
      severityText: 'ERROR',
      body: message,
      attributes: toAttributes(meta),
    });
  },
};
