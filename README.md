# MCP Agent Service

MCPアーキテクチャに基づくAIエージェントサービスの実装です。

## 🚀 セットアップ

### 必要要件
- Node.js 18以上
- Docker（オプション）

### インストール
```bash
npm install
```

### 環境設定
```bash
cp .env.example .env
# .envファイルを編集してAPI_KEYを設定
```

## 🏃‍♂️ 実行方法

### 開発環境
```bash
npm run dev
```

### 本番環境
```bash
npm run build
npm start
```

### Docker使用
```bash
docker-compose up -d
```

## 🧪 テスト
```bash
npm test
```

## 📡 API仕様

### ヘルスチェック
```
GET /health
Response:
{
  "status": "healthy",
  "agent": "MCPAgent",
  "version": "1.0.0",
  "buildDate": "2025-07-03T12:00:00Z"
}
```

### バージョン情報
```
GET /version
Response:
{
  "name": "mcp-agent",
  "version": "1.0.0",
  "description": "MCP Agent Service",
  "buildDate": "2025-07-03T12:00:00Z",
  "nodeVersion": "v18.19.0",
  "gitCommit": "abc123def"
}
```

### 処理エンドポイント
```
POST /process
Headers:
  x-api-key: your-api-key

Body:
{
  "sessionId": "unique-session-id",
  "input": "処理したいテキストまたはオブジェクト",
  "meta": {
    "userId": "user123",
    "sourceFile": "example.txt"
  }
}

Response:
{
  "sessionId": "unique-session-id",
  "output": "処理結果",
  "tokenUsage": {
    "promptTokens": 100,
    "completionTokens": 50,
    "totalTokens": 150
  },
  "latencyMs": 250,
  "agent": "SampleAgent"
}
```

## 📊 ログ形式

すべてのログはJSON形式で標準出力に出力されます：

```json
{
  "timestamp": "2025-07-03T12:00:00Z",
  "sessionId": "abc-123",
  "agent": "SampleAgent",
  "inputLength": 234,
  "outputLength": 112,
  "latencyMs": 1400,
  "tokenUsage": {
    "promptTokens": 200,
    "completionTokens": 100,
    "totalTokens": 300
  },
  "error": null,
  "logStage": "processed"
}
```

## 🏗️ アーキテクチャ

- **BaseAgent**: エージェントの基底クラス
- **SampleAgent**: サンプル実装（スタブ）
- **認証**: X-API-KEYヘッダーによる認証
- **バリデーション**: Joiによる入力検証
- **ログ**: Winstonによる構造化ログ

## 🔧 拡張方法

新しいエージェントを追加する場合：

1. `src/agents/`に新しいエージェントクラスを作成
2. `BaseAgent`を継承
3. `processInput`メソッドを実装
4. `src/index.ts`でエージェントをインスタンス化

```typescript
import { BaseAgent } from './baseAgent';
import { MCPInput, MCPOutput } from '../types';

export class MyAgent extends BaseAgent {
  constructor() {
    super('MyAgent');
  }

  async processInput(input: MCPInput): Promise<MCPOutput> {
    // 実装
  }
}
```