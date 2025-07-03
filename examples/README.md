# MCPエージェント実装例

このディレクトリには、実用的なMCPエージェントの実装例が含まれています。

## 📚 サンプルエージェント

| 🤖 エージェント | 📝 説明 | 🔗 リンク |
|-------------|--------|--------|
| **Summary Agent** | テキスト・PDF要約エージェント | [📁 summary-agent/](summary-agent/) |
| **Classify Agent** | テキスト分類・カテゴリ判定エージェント | [📁 classify-agent/](classify-agent/) |
| **Structure Agent** | 非構造化データの構造化エージェント | [📁 structure-agent/](structure-agent/) |

## 🚀 使用方法

### 1. 基本的な使い方

```bash
# 任意のサンプルディレクトリに移動
cd examples/summary-agent

# 依存関係をインストール
npm install

# 環境設定
cp .env.example .env
# .envファイルにLLM APIキーを設定

# 開発サーバー起動
npm run dev

# 動作確認
curl -X POST http://localhost:3000/summary-process \
  -H "x-api-key: development-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "input": "長いテキストをここに貼り付け..."
  }'
```

### 2. 自分のプロジェクトへの統合

各サンプルエージェントは独立して動作しますが、以下の方法で既存プロジェクトに統合できます：

```typescript
// 1. エージェントクラスをコピー
import { SummaryAgent } from './agents/summaryAgent';

// 2. インスタンス化
const summaryAgent = new SummaryAgent();

// 3. エンドポイント追加
app.post('/summary', authenticateApiKey, validateInput, async (req, res) => {
  const result = await summaryAgent.execute(req.body);
  res.json(result);
});
```

## 🔧 カスタマイズ例

### プロンプトの変更

```typescript
// prompts/summary.txt を編集
const customPrompt = `
あなたは専門的な要約エージェントです。
以下の文書を3つのポイントに要約してください：
1. 主要な論点
2. 重要な数値・データ
3. 結論・提案

文書: {{text}}
`;
```

### LLM設定の変更

```bash
# .env
OPENAI_MODEL=gpt-4-1106-preview
CLAUDE_MODEL=claude-3-opus-20240229
MAX_TOKENS=2000
TEMPERATURE=0.3
```

### 出力形式のカスタマイズ

```typescript
return {
  sessionId: input.sessionId,
  output: {
    summary: result.summary,
    keyPoints: result.keyPoints,
    confidence: result.confidence,
    wordCount: result.wordCount
  },
  // ...
};
```

## 📋 実装パターン

### 1. シンプルな変換エージェント

```typescript
export class SimpleAgent extends BaseAgent {
  async processInput(input: MCPInput): Promise<MCPOutput> {
    const result = await this.transform(input.input);
    return this.createOutput(input.sessionId, result);
  }
}
```

### 2. LLM統合エージェント

```typescript
export class LLMAgent extends BaseAgent {
  async processInput(input: MCPInput): Promise<MCPOutput> {
    const prompt = this.buildPrompt(input.input);
    const response = await this.callLLM(prompt);
    return this.createOutput(input.sessionId, response);
  }
}
```

### 3. 外部API連携エージェント

```typescript
export class APIAgent extends BaseAgent {
  async processInput(input: MCPInput): Promise<MCPOutput> {
    const apiResult = await this.callExternalAPI(input.input);
    const processed = await this.processAPIResult(apiResult);
    return this.createOutput(input.sessionId, processed);
  }
}
```

## 🧪 テスト方法

```bash
# 各エージェントのテスト実行
cd examples/summary-agent
npm test

# 統合テスト
npm run test:integration

# パフォーマンステスト
npm run test:performance
```

## 📊 パフォーマンス最適化

### バッチ処理

```typescript
export class BatchSummaryAgent extends SummaryAgent {
  async processBatch(inputs: MCPInput[]): Promise<MCPOutput[]> {
    return Promise.all(inputs.map(input => this.execute(input)));
  }
}
```

### キャッシュ機能

```typescript
export class CachedAgent extends BaseAgent {
  private cache = new Map<string, any>();

  async processInput(input: MCPInput): Promise<MCPOutput> {
    const cacheKey = this.generateCacheKey(input);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const result = await super.processInput(input);
    this.cache.set(cacheKey, result);
    return result;
  }
}
```

## 🔗 関連リンク

- [メインテンプレート](../) - MCP Agent Service Template
- [カスタマイズガイド](../docs/customization.md)
- [API仕様](../docs/api.md)
- [デプロイガイド](../docs/deployment.md)

---

**これらのサンプルを参考に、独自のMCPエージェントを開発してください！** 🚀