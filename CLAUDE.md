# Claude Development Guide

このファイルは、Claude Code（AI開発アシスタント）がこのプロジェクトを効率的に理解・開発するための情報を記載しています。

## プロジェクト概要

**MCP Agent Service** - MCPアーキテクチャに基づくAIエージェントサービス

### 主要な技術スタック
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Testing**: Jest
- **Logging**: Winston
- **Validation**: Joi
- **Container**: Docker

### アーキテクチャ
- **BaseAgent**: 全エージェントの基底クラス
- **SampleAgent**: サンプル実装（スタブ）
- **認証**: X-API-KEYヘッダー
- **ログ**: セッションIDによるトレース
- **バリデーション**: 入力検証ミドルウェア

## 開発コマンド

```bash
# 開発環境起動
npm run dev

# テスト実行
npm test

# 型チェック
npm run typecheck

# リント
npm run lint

# ビルド
npm run build

# 本番環境起動
npm start

# Docker起動
docker-compose up -d
```

## API仕様

### メインエンドポイント
```
POST /process
Headers: x-api-key: <API_KEY>
Body: {
  "sessionId": "string",
  "input": "string | object",
  "meta": { "userId": "string", "sourceFile": "string" }
}
```

### ヘルスチェック
```
GET /health
```

### バージョン情報
```
GET /version
```

## ディレクトリ構造

```
src/
├── index.ts              # メインサーバー
├── types/               # TypeScript型定義
├── agents/              # エージェント実装
│   ├── baseAgent.ts     # 基底クラス
│   └── sampleAgent.ts   # サンプル実装
├── middleware/          # Express ミドルウェア
│   ├── auth.ts          # 認証
│   └── validation.ts    # バリデーション
├── utils/               # ユーティリティ
│   └── logger.ts        # ログ機能
└── __tests__/           # テストファイル
```

## 新しいエージェントの追加方法

1. `src/agents/`に新しいエージェントクラスを作成
2. `BaseAgent`を継承
3. `processInput`メソッドを実装
4. `src/index.ts`でエージェントをインスタンス化

例：
```typescript
export class MyAgent extends BaseAgent {
  constructor() {
    super('MyAgent');
  }

  async processInput(input: MCPInput): Promise<MCPOutput> {
    // 実装
  }
}
```

## 環境変数

```env
PORT=3000
API_KEY=your-api-key-here
LOG_LEVEL=info
NODE_ENV=development
```

## ログ形式

JSON形式でstdoutに出力：
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

## テスト戦略

- **Unit Tests**: 各コンポーネントの単体テスト
- **Integration Tests**: API エンドポイントのテスト
- **Coverage**: 主要機能のテストカバレッジ

### テストパターン
- 正常処理
- 異常処理（無効な入力、API障害）
- 認証・認可
- バリデーション

## 開発時の注意点

1. **セキュリティ**: PII情報をログに出力しない
2. **パフォーマンス**: 5秒以内で応答
3. **同時実行**: 10req/secに対応
4. **セッションID**: 必ず伝播させる
5. **エラーハンドリング**: 適切なエラーレスポンス

## トラブルシューティング

### よくある問題
- **認証エラー**: X-API-KEYヘッダーの設定確認
- **バリデーションエラー**: 入力スキーマの確認
- **テスト失敗**: 環境変数の設定確認

### デバッグ方法
```bash
# 詳細ログ出力
LOG_LEVEL=debug npm run dev

# 特定のテスト実行
npm test -- --testNamePattern="test name"
```

## 拡張予定

- LLM API統合（OpenAI、Claude等）
- 複数エージェント対応
- ログ可視化ダッシュボード
- MCP間連携機能