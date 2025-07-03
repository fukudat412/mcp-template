# {{ cookiecutter.project_name }}

{{ cookiecutter.project_description }}

## 🎯 概要

**MCP (Multi-agent Control Platform)** アーキテクチャに基づくAIエージェントサービスです。

### 主な特徴
- ✅ {{ cookiecutter.agent_name }} エージェント実装
- ✅ セッションIDによるログトレーサビリティ
- ✅ 本番環境対応（Docker、CI/CD）
{% if cookiecutter.include_llm_integration != "none" %}- ✅ {{ cookiecutter.include_llm_integration|title }} LLM統合{% endif %}
{% if cookiecutter.include_database != "none" %}- ✅ {{ cookiecutter.include_database|title }} データベース統合{% endif %}
{% if cookiecutter.include_monitoring == "y" %}- ✅ Prometheus メトリクス対応{% endif %}

### 技術スタック
- **Node.js 18+** + **TypeScript** + **Express.js**
- **Jest** (テスト) + **Winston** (ログ) + **Docker**
{% if cookiecutter.include_llm_integration != "none" %}- **{{ cookiecutter.include_llm_integration|title }}** (LLM統合){% endif %}
{% if cookiecutter.include_database != "none" %}- **{{ cookiecutter.include_database|title }}** (データベース){% endif %}

## 🚀 クイックスタート

```bash
# 依存関係をインストール
npm install

# 環境設定
cp .env.example .env
# .envファイルを編集

# 開発サーバー起動
npm run dev

# 動作確認
curl http://localhost:3000/health
```

## 📡 API仕様

### {{ cookiecutter.agent_name }} エンドポイント

**POST /{{ cookiecutter.agent_endpoint }}**

```bash
curl -X POST http://localhost:3000/{{ cookiecutter.agent_endpoint }} \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "input": "処理したいデータ"
  }'
```

## 🧪 テスト

```bash
npm test                    # 全テスト実行
npm test -- --watch         # ウォッチモード
npm test -- --coverage      # カバレッジ付き
```

## 🐳 Docker

```bash
# 開発用
docker-compose up -d

# 本番用
API_KEY=your-production-key docker-compose up -d
```

## 📚 ドキュメント

詳細なドキュメントは [MCP Template](https://github.com/fukudat412/mcp-template) を参照してください。

## 📄 ライセンス

このプロジェクトは [{{ cookiecutter.license }} License](LICENSE) の下で提供されています。

---

**Created with [MCP Template](https://github.com/fukudat412/mcp-template)** 🚀