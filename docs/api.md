# API仕様

## 📡 エンドポイント一覧

### ヘルスチェック

**GET /health**

サーバーの稼働状況とバージョン情報を取得します。

```bash
curl http://localhost:3000/health
```

**レスポンス:**
```json
{
  "status": "healthy",
  "agent": "MCPAgent",
  "version": "1.0.0",
  "buildDate": "2025-07-03T12:00:00Z"
}
```

### バージョン情報

**GET /version**

詳細なバージョン情報を取得します。

```bash
curl http://localhost:3000/version
```

**レスポンス:**
```json
{
  "name": "mcp-agent",
  "version": "1.0.0",
  "description": "MCP Agent Service",
  "buildDate": "2025-07-03T12:00:00Z",
  "nodeVersion": "v18.19.0",
  "gitCommit": "abc123def"
}
```

### メイン処理エンドポイント

**POST /process**

エージェントによる処理を実行します。

**ヘッダー:**
```
Content-Type: application/json
x-api-key: your-api-key
```

**リクエスト:**
```json
{
  "sessionId": "unique-session-id",
  "input": "処理したいテキストまたはオブジェクト",
  "meta": {
    "userId": "user123",
    "sourceFile": "example.txt"
  }
}
```

**レスポンス:**
```json
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

## 🔐 認証

すべてのAPIエンドポイント（ヘルスチェック除く）は、X-API-KEYヘッダーによる認証が必要です。

```bash
curl -X POST http://localhost:3000/process \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-123", "input": "Hello World"}'
```

## 📝 リクエスト・レスポンス仕様

### 入力スキーマ (MCPInput)

```typescript
interface MCPInput {
  sessionId: string;        // 必須: セッション識別子
  input: string | object;   // 必須: 処理対象データ
  meta?: {                  // オプション: メタデータ
    userId?: string;
    sourceFile?: string;
    [key: string]: any;
  };
}
```

### 出力スキーマ (MCPOutput)

```typescript
interface MCPOutput {
  sessionId: string;        // セッション識別子
  output: string | object;  // 処理結果
  tokenUsage?: {           // LLM使用時のトークン情報
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;       // 処理時間（ミリ秒）
  agent: string;           // 処理したエージェント名
}
```

## ❌ エラーレスポンス

### 認証エラー

**401 Unauthorized**
```json
{
  "error": "API key required"
}
```

**403 Forbidden**
```json
{
  "error": "Invalid API key"
}
```

### バリデーションエラー

**400 Bad Request**
```json
{
  "error": "Invalid input",
  "details": [
    "sessionId is required",
    "input must be string or object"
  ]
}
```

### 処理エラー

**500 Internal Server Error**
```json
{
  "error": "Processing failed",
  "message": "LLM API timeout"
}
```

## 📊 ログ形式

すべてのリクエストはJSON形式でログ出力されます：

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

### ログステージ

- `received`: リクエスト受信時
- `processed`: 処理完了時
- `error`: エラー発生時

## 🔄 レート制限

デフォルト設定では以下の制限があります：

- **同時接続数**: 10接続
- **レスポンス時間**: 5秒以内
- **リクエストサイズ**: 10MB以下

カスタマイズは環境変数で調整可能です：

```bash
MAX_CONNECTIONS=20
REQUEST_TIMEOUT=10000
MAX_REQUEST_SIZE=50mb
```