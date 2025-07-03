import request from 'supertest';
import app from '../index';

describe('MCP Agent API', () => {
  const validApiKey = process.env.API_KEY || 'development-key';

  describe('GET /health', () => {
    it('should return health status', async () => {
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

  describe('POST /process', () => {
    it('should process valid request', async () => {
      const input = {
        sessionId: 'test-session-123',
        input: 'test input'
      };

      const response = await request(app)
        .post('/process')
        .set('x-api-key', validApiKey)
        .send(input)
        .expect(200);

      expect(response.body).toMatchObject({
        sessionId: 'test-session-123',
        output: 'test input_processed',
        agent: 'SampleAgent',
        latencyMs: expect.any(Number),
        tokenUsage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150
        }
      });
    });

    it('should process object input', async () => {
      const input = {
        sessionId: 'test-session-456',
        input: { data: 'test', value: 42 }
      };

      const response = await request(app)
        .post('/process')
        .set('x-api-key', validApiKey)
        .send(input)
        .expect(200);

      expect(response.body).toMatchObject({
        sessionId: 'test-session-456',
        output: { data: 'test', value: 42, processed: true },
        agent: 'SampleAgent'
      });
    });

    it('should require API key', async () => {
      const input = {
        sessionId: 'test-session-789',
        input: 'test'
      };

      const response = await request(app)
        .post('/process')
        .send(input)
        .expect(401);

      expect(response.body).toEqual({
        error: 'API key required'
      });
    });

    it('should validate input', async () => {
      const invalidInput = {
        input: 'test' // missing sessionId
      };

      const response = await request(app)
        .post('/process')
        .set('x-api-key', validApiKey)
        .send(invalidInput)
        .expect(400);

      expect(response.body.error).toBe('Invalid input');
      expect(response.body.details).toBeDefined();
    });

    it('should handle processing errors gracefully', async () => {
      // Test with malformed input that might cause an error
      const input = {
        sessionId: 'error-test',
        input: null
      };

      const response = await request(app)
        .post('/process')
        .set('x-api-key', validApiKey)
        .send(input)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });
});