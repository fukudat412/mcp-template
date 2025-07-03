import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticateApiKey } from './middleware/auth';
import { validateInput } from './middleware/validation';
import { {{ cookiecutter.agent_class_name }} } from './agents/{{ cookiecutter.agent_name.lower() }}';
import logger from './utils/logger';
import { getVersionInfo } from './utils/version';
import { MCPInput } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const version = getVersionInfo();
  res.json({ 
    status: 'healthy', 
    agent: '{{ cookiecutter.agent_class_name }}',
    version: version.version,
    buildDate: version.buildDate
  });
});

// Version endpoint
app.get('/version', (req: Request, res: Response) => {
  res.json(getVersionInfo());
});

// Agent instance
const {{ cookiecutter.agent_name.lower() }} = new {{ cookiecutter.agent_class_name }}();

// Main processing endpoint
app.post('/{{ cookiecutter.agent_endpoint }}', authenticateApiKey, validateInput, async (req: Request, res: Response) => {
  const input: MCPInput = req.body;

  try {
    const output = await {{ cookiecutter.agent_name.lower() }}.execute(input);
    res.json(output);
  } catch (error) {
    logger.error('Processing error:', error);
    res.status(500).json({
      error: 'Processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    const version = getVersionInfo();
    logger.info(`${version.name} v${version.version} running on port ${PORT}`, {
      version: version.version,
      buildDate: version.buildDate,
      nodeVersion: version.nodeVersion,
      gitCommit: version.gitCommit
    });
  });
}

export default app;