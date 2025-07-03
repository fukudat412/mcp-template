import { MCPInput, MCPOutput } from '../types';
import { logRequest } from '../utils/logger';

export abstract class BaseAgent {
  protected agentName: string;

  constructor(agentName: string) {
    this.agentName = agentName;
  }

  abstract processInput(input: MCPInput): Promise<MCPOutput>;

  async execute(input: MCPInput): Promise<MCPOutput> {
    const startTime = Date.now();
    
    logRequest({
      sessionId: input.sessionId,
      agent: this.agentName,
      inputLength: JSON.stringify(input.input).length,
      logStage: 'received'
    });

    try {
      const result = await this.processInput(input);
      const latencyMs = Date.now() - startTime;
      
      const output: MCPOutput = {
        ...result,
        latencyMs,
        agent: this.agentName
      };

      logRequest({
        sessionId: input.sessionId,
        agent: this.agentName,
        inputLength: JSON.stringify(input.input).length,
        outputLength: JSON.stringify(output.output).length,
        latencyMs,
        tokenUsage: output.tokenUsage,
        logStage: 'processed'
      });

      return output;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      
      logRequest({
        sessionId: input.sessionId,
        agent: this.agentName,
        inputLength: JSON.stringify(input.input).length,
        latencyMs,
        error: error instanceof Error ? error.message : 'Unknown error',
        logStage: 'error'
      });

      throw error;
    }
  }
}