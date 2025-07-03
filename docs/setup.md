# セットアップガイド

## 🚀 クイックスタート

### 方法1: テンプレートを直接クローン

```bash
# 1. リポジトリをクローン
git clone https://github.com/fukudat412/mcp-template.git my-mcp-agent
cd my-mcp-agent

# 2. 依存関係をインストール
npm install

# 3. 環境設定
cp .env.example .env
# .envファイルを編集（API_KEY等）

# 4. 開発サーバー起動
npm run dev

# 5. 動作確認
curl http://localhost:3000/health
```

### 方法2: GitHub Templateとして使用

1. GitHubで「Use this template」ボタンをクリック
2. 新しいリポジトリ名を設定
3. クローンして上記手順2-5を実行

### 方法3: 初期化スクリプトを使用

```bash
# リポジトリをクローンしてスクリプト実行
git clone https://github.com/fukudat412/mcp-template.git
cd mcp-template
node scripts/create-mcp-agent.js
```

## 🏃‍♂️ 実行方法

### 開発環境
```bash
npm run dev          # 開発サーバー起動（ホットリロード）
npm run test         # テスト実行
npm run typecheck    # 型チェック
npm run lint         # コード品質チェック
```

### 本番環境
```bash
npm run build        # TypeScriptビルド
npm start           # 本番サーバー起動
```

### Docker環境
```bash
# 開発用
docker-compose up -d

# 本番用（環境変数指定）
API_KEY=your-production-key docker-compose up -d
```

## 🧪 テスト

```bash
npm test                    # 全テスト実行
npm test -- --watch         # ウォッチモード
npm test -- --coverage      # カバレッジ付き
```

## ⚙️ 環境変数

### 基本設定

```bash
# .env
PORT=3000
API_KEY=your-secret-key
LOG_LEVEL=info
NODE_ENV=development
```

### LLM API設定

```bash
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# Claude
CLAUDE_API_KEY=...
CLAUDE_MODEL=claude-3-sonnet

# その他
MISTRAL_API_KEY=...
```

### データベース設定（必要に応じて）

```bash
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/mcp_agent

# Redis
REDIS_URL=redis://localhost:6379
```

## 🔧 トラブルシューティング

### よくある問題

**ポート3000が使用中**
```bash
# 別のポートを使用
PORT=3001 npm run dev
```

**権限エラー**
```bash
# Docker使用時
sudo docker-compose up -d
```

**テスト失敗**
```bash
# 依存関係の再インストール
rm -rf node_modules package-lock.json
npm install
```

### ログ設定

```bash
# 詳細ログ出力
LOG_LEVEL=debug npm run dev

# 特定のテスト実行
npm test -- --testNamePattern="test name"
```

## 📁 プロジェクト構造

```
my-mcp-agent/
├── src/
│   ├── agents/          # エージェント実装
│   ├── middleware/      # Express ミドルウェア
│   ├── types/          # TypeScript型定義
│   ├── utils/          # ユーティリティ
│   └── index.ts        # メインサーバー
├── docs/               # ドキュメント
├── scripts/            # 便利スクリプト
├── Dockerfile          # Docker設定
├── docker-compose.yml  # Docker Compose設定
└── package.json        # プロジェクト設定
```