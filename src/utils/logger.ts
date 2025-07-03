import winston from 'winston';
import { LogEntry } from '../types';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

export const logRequest = (entry: Partial<LogEntry>): void => {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    sessionId: entry.sessionId || 'unknown',
    agent: entry.agent || 'MCPAgent',
    inputLength: entry.inputLength,
    outputLength: entry.outputLength,
    latencyMs: entry.latencyMs,
    tokenUsage: entry.tokenUsage,
    error: entry.error || null,
    logStage: entry.logStage || 'processed'
  };

  if (entry.error) {
    logger.error(logEntry);
  } else {
    logger.info(logEntry);
  }
};

export default logger;