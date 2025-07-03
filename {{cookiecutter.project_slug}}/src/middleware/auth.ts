import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const authenticateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  const expectedApiKey = process.env.API_KEY || 'development-key';

  if (!apiKey) {
    logger.warn('API request without API key');
    res.status(401).json({ error: 'API key required' });
    return;
  }

  if (apiKey !== expectedApiKey) {
    logger.warn('API request with invalid API key');
    res.status(403).json({ error: 'Invalid API key' });
    return;
  }

  next();
};