export interface MCPInput {
  sessionId: string;
  input: string | object;
  meta?: {
    userId?: string;
    sourceFile?: string;
    [key: string]: any;
  };
}

export interface MCPOutput {
  sessionId: string;
  output: string | object;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  agent: string;
}

export interface LogEntry {
  timestamp: string;
  sessionId: string;
  agent: string;
  inputLength?: number;
  outputLength?: number;
  latencyMs?: number;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string | null;
  logStage?: 'received' | 'processed' | 'error';
}