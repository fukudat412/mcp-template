import { SampleAgent } from '../../agents/sampleAgent';
import { MCPInput } from '../../types';

describe('SampleAgent', () => {
  let agent: SampleAgent;

  beforeEach(() => {
    agent = new SampleAgent();
  });

  describe('processInput', () => {
    it('should process string input correctly', async () => {
      const input: MCPInput = {
        sessionId: 'test-session-123',
        input: 'test input'
      };

      const result = await agent.execute(input);

      expect(result.sessionId).toBe('test-session-123');
      expect(result.output).toBe('test input_processed');
      expect(result.agent).toBe('SampleAgent');
      expect(result.latencyMs).toBeGreaterThan(0);
      expect(result.tokenUsage).toEqual({
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150
      });
    });

    it('should process object input correctly', async () => {
      const input: MCPInput = {
        sessionId: 'test-session-456',
        input: { data: 'test', count: 5 }
      };

      const result = await agent.execute(input);

      expect(result.sessionId).toBe('test-session-456');
      expect(result.output).toEqual({ data: 'test', count: 5, processed: true });
      expect(result.agent).toBe('SampleAgent');
    });

    it('should include meta information', async () => {
      const input: MCPInput = {
        sessionId: 'test-session-789',
        input: 'test',
        meta: {
          userId: 'user123',
          sourceFile: 'test.txt'
        }
      };

      const result = await agent.execute(input);

      expect(result.sessionId).toBe('test-session-789');
      expect(result.output).toBe('test_processed');
    });
  });
});