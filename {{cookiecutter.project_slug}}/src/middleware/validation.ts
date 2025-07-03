import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { MCPInput } from '../types';

const inputSchema = Joi.object({
  sessionId: Joi.string().required(),
  input: Joi.alternatives().try(
    Joi.string(),
    Joi.object()
  ).required(),
  meta: Joi.object({
    userId: Joi.string(),
    sourceFile: Joi.string()
  }).unknown(true).optional()
});

export const validateInput = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = inputSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({
      error: 'Invalid input',
      details: error.details.map(d => d.message)
    });
    return;
  }
  
  next();
};