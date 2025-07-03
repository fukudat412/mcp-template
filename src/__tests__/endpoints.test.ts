import request from 'supertest';
import app from '../index';

describe('Version endpoints', () => {
  describe('GET /version', () => {
    it('should return version information', async () => {
      const response = await request(app)
        .get('/version')
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'mcp-agent',
        version: '1.0.0',
        description: 'MCP Agent Service',
        nodeVersion: expect.any(String),
        buildDate: expect.any(String),
        gitCommit: expect.any(String)
      });

      expect(response.body.nodeVersion).toBe(process.version);
    });
  });

  describe('GET /health', () => {
    it('should return health status with version', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        agent: 'MCPAgent',
        version: '1.0.0',
        buildDate: expect.any(String)
      });
    });
  });
});