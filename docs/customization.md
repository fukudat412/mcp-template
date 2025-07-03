# カスタマイズガイド

## 🎨 新しいエージェントの追加

### 1. エージェントクラスの作成

```typescript
// src/agents/myCustomAgent.ts
import { BaseAgent } from './baseAgent';
import { MCPInput, MCPOutput } from '../types';

export class MyCustomAgent extends BaseAgent {
  constructor() {
    super('MyCustomAgent');  // エージェント名
  }

  async processInput(input: MCPInput): Promise<MCPOutput> {
    // カスタム処理の実装
    const processedData = await this.customProcess(input.input);
    
    return {
      sessionId: input.sessionId,
      output: processedData,
      tokenUsage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      },
      latencyMs: 0, // BaseAgentが自動設定
      agent: this.agentName
    };
  }

  private async customProcess(input: any): Promise<any> {
    // LLM API呼び出し、データ処理等
    return input;
  }
}
```

### 2. エージェントの登録

```typescript
// src/index.ts
import { MyCustomAgent } from './agents/myCustomAgent';

const customAgent = new MyCustomAgent();

app.post('/custom-process', authenticateApiKey, validateInput, async (req, res) => {
  const result = await customAgent.execute(req.body);
  res.json(result);
});
```

### 3. テストの追加

```typescript
// src/__tests__/agents/myCustomAgent.test.ts
import { MyCustomAgent } from '../../agents/myCustomAgent';

describe('MyCustomAgent', () => {
  let agent: MyCustomAgent;

  beforeEach(() => {
    agent = new MyCustomAgent();
  });

  it('should process input correctly', async () => {
    const input = {
      sessionId: 'test-123',
      input: 'test data'
    };

    const result = await agent.execute(input);
    
    expect(result.agent).toBe('MyCustomAgent');
    expect(result.sessionId).toBe('test-123');
  });
});
```

## 🔌 LLM統合例

### OpenAI GPT統合

```typescript
import OpenAI from 'openai';

export class GPTAgent extends BaseAgent {
  private openai: OpenAI;

  constructor() {
    super('GPTAgent');
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async processInput(input: MCPInput): Promise<MCPOutput> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'user', content: input.input as string }
      ]
    });

    return {
      sessionId: input.sessionId,
      output: response.choices[0].message.content || '',
      tokenUsage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      },
      latencyMs: 0,
      agent: this.agentName
    };
  }
}
```

### Claude統合

```typescript
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeAgent extends BaseAgent {
  private anthropic: Anthropic;

  constructor() {
    super('ClaudeAgent');
    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY
    });
  }

  async processInput(input: MCPInput): Promise<MCPOutput> {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [
        { role: 'user', content: input.input as string }
      ]
    });

    return {
      sessionId: input.sessionId,
      output: response.content[0].text,
      tokenUsage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens
      },
      latencyMs: 0,
      agent: this.agentName
    };
  }
}
```

## 📝 プロンプト管理

### プロンプトファイルの管理

```bash
mkdir prompts
echo "あなたは文書要約の専門家です..." > prompts/summary.txt
echo "以下のデータを分析してください..." > prompts/analysis.txt
```

### プロンプトユーティリティ

```typescript
// src/utils/prompt.ts
import { readFileSync } from 'fs';
import { join } from 'path';

export class PromptManager {
  private static promptCache = new Map<string, string>();

  static getPrompt(name: string): string {
    if (this.promptCache.has(name)) {
      return this.promptCache.get(name)!;
    }

    try {
      const promptPath = join(process.cwd(), 'prompts', `${name}.txt`);
      const prompt = readFileSync(promptPath, 'utf8');
      this.promptCache.set(name, prompt);
      return prompt;
    } catch (error) {
      throw new Error(`Prompt file not found: ${name}`);
    }
  }

  static formatPrompt(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }
}
```

### 使用例

```typescript
export class SummaryAgent extends BaseAgent {
  async processInput(input: MCPInput): Promise<MCPOutput> {
    const promptTemplate = PromptManager.getPrompt('summary');
    const prompt = PromptManager.formatPrompt(promptTemplate, {
      text: input.input as string,
      language: 'Japanese'
    });

    // LLM API呼び出し
    const result = await this.callLLM(prompt);
    
    return {
      sessionId: input.sessionId,
      output: result,
      latencyMs: 0,
      agent: this.agentName
    };
  }
}
```

## 🔧 ミドルウェアのカスタマイズ

### カスタム認証

```typescript
// src/middleware/customAuth.ts
export const customAuthenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['authorization']?.replace('Bearer ', '');
  
  if (!isValidApiKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  req.user = getUserFromApiKey(apiKey);
  next();
};
```

### リクエスト制限

```typescript
// src/middleware/rateLimit.ts
import { rateLimit } from 'express-rate-limit';

export const createRateLimit = (maxRequests: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
  });
};
```

## 📊 ログのカスタマイズ

### 追加ログフィールド

```typescript
logRequest({
  sessionId: input.sessionId,
  agent: this.agentName,
  customField: 'custom-value',
  processingSteps: ['step1', 'step2'],
  userAgent: req.headers['user-agent'],
  clientIp: req.ip
});
```

### ログフォーマッター

```typescript
// src/utils/customLogger.ts
import winston from 'winston';

const customFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      '@timestamp': timestamp,
      level,
      message,
      service: 'mcp-agent',
      ...meta
    });
  })
);

export const customLogger = winston.createLogger({
  format: customFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});
```

## 🗃️ データベース統合

### PostgreSQL統合

```typescript
// src/utils/database.ts
import { Pool } from 'pg';

export class DatabaseManager {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  async saveSession(sessionId: string, data: any): Promise<void> {
    await this.pool.query(
      'INSERT INTO sessions (id, data, created_at) VALUES ($1, $2, NOW())',
      [sessionId, JSON.stringify(data)]
    );
  }

  async getSession(sessionId: string): Promise<any> {
    const result = await this.pool.query(
      'SELECT data FROM sessions WHERE id = $1',
      [sessionId]
    );
    return result.rows[0]?.data;
  }
}
```

## 🌐 外部API統合

### Webhook対応

```typescript
// src/routes/webhook.ts
app.post('/webhook/:agentName', async (req, res) => {
  const { agentName } = req.params;
  const agent = getAgentByName(agentName);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  const sessionId = generateSessionId();
  const result = await agent.execute({
    sessionId,
    input: req.body,
    meta: { source: 'webhook' }
  });

  res.json(result);
});
```