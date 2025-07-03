# MCP Agent Service Template

MCPアーキテクチャに基づくAIエージェントサービスのテンプレートリポジトリです。

## 🎯 概要

**MCP (Multi-agent Control Platform)** アーキテクチャに基づくAIエージェントサービスを効率的に構築・量産するためのテンプレートです。

### 主な特徴
- ✅ 統一的なエージェント管理・制御
- ✅ セッションIDによるログトレーサビリティ  
- ✅ 再利用可能な設計パターン
- ✅ 本番環境対応（Docker、CI/CD）
- ✅ 24のテストケース実装済み

### 技術スタック
- **Node.js 18+** + **TypeScript** + **Express.js**
- **Jest** (テスト) + **Winston** (ログ) + **Docker**

## 🚀 クイックスタート

```bash
# テンプレートをクローン
git clone https://github.com/fukudat412/mcp-template.git my-mcp-agent
cd my-mcp-agent

# セットアップ
npm install
cp .env.example .env

# 開発サーバー起動
npm run dev

# 動作確認
curl http://localhost:3000/health
```

**他の方法:**
- 🌟 GitHub Template機能で新規リポジトリ作成
- 🛠️ 初期化スクリプト: `node scripts/create-mcp-agent.js`

## 📚 ドキュメント

| 📖 ガイド | 📝 説明 |
|----------|---------|
| **[セットアップ](docs/setup.md)** | インストール・環境構築・実行方法 |
| **[API仕様](docs/api.md)** | エンドポイント・認証・レスポンス形式 |
| **[カスタマイズ](docs/customization.md)** | エージェント追加・LLM統合・拡張方法 |
| **[デプロイ](docs/deployment.md)** | Docker・K8s・監視・スケーリング |
| **[コントリビューション](docs/contribution.md)** | 貢献方法・開発ガイドライン |

### 設計ドキュメント
- **[MCPテンプレート.md](MCPテンプレート.md)** - MCP設計・実装ガイド
- **[実装指示書.md](MCPテンプレート実装指示書.md)** - 技術仕様書
- **[CLAUDE.md](CLAUDE.md)** - Claude開発者向けガイド

## 🤝 コントリビューション・サポート

- 🐛 **バグ報告**: [Issues](https://github.com/fukudat412/mcp-template/issues)
- 💡 **機能提案**: [Discussions](https://github.com/fukudat412/mcp-template/discussions)
- 🔧 **プルリクエスト**: [貢献ガイド](docs/contribution.md)

## 📄 ライセンス

**[MIT License](LICENSE)** - 商用利用・修正・配布可能

---

**⭐ 役に立ったらスターをお願いします！**