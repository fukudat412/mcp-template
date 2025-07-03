import { BaseAgent } from './baseAgent';
import { MCPInput, MCPOutput } from '../types';

export class SampleAgent extends BaseAgent {
  constructor() {
    super('SampleAgent');
  }

  async processInput(input: MCPInput): Promise<MCPOutput> {
    // Stub implementation for demo
    // In real implementation, this would call LLM or process data
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing time

    const processedOutput = typeof input.input === 'string' 
      ? `${input.input}_processed`
      : { ...input.input, processed: true };

    return {
      sessionId: input.sessionId,
      output: processedOutput,
      tokenUsage: {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150
      },
      latencyMs: 0, // Will be set by BaseAgent
      agent: this.agentName
    };
  }
}