# Contributing to MCP Agent Service

このプロジェクトへの貢献を歓迎します。

## 開発環境のセットアップ

### 必要要件
- Node.js 18以上
- npm
- Docker (オプション)

### セットアップ手順

1. リポジトリをクローン
```bash
git clone <repository-url>
cd mcp-template
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
cp .env.example .env
# .envファイルを編集
```

4. 開発サーバーを起動
```bash
npm run dev
```

## 開発フロー

### ブランチ戦略
- `main`: 本番環境用
- `develop`: 開発環境用
- `feature/*`: 新機能開発用
- `fix/*`: バグ修正用

### プルリクエスト

1. featureブランチを作成
```bash
git checkout -b feature/your-feature-name
```

2. 変更をコミット
```bash
git add .
git commit -m "feat: add new feature"
```

3. テストを実行
```bash
npm test
npm run typecheck
npm run lint
```

4. プルリクエストを作成

## コーディング規約

### TypeScript
- 型注釈を適切に使用
- `any`型は可能な限り避ける
- インターフェースを活用

### コミットメッセージ
Conventional Commits形式を使用：
- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント更新
- `style:` コードスタイル変更
- `refactor:` リファクタリング
- `test:` テスト追加・修正
- `chore:` その他の変更

### テスト
- 新機能には必ずテストを追加
- テストカバレッジを維持
- 単体テストと統合テストの両方を実装

## 新しいエージェントの追加

1. `src/agents/`に新しいエージェントクラスを作成
2. `BaseAgent`を継承
3. `processInput`メソッドを実装
4. テストを追加
5. ドキュメントを更新

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

## 問題報告

バグや問題を発見した場合は、Issueを作成してください。

### Issue作成時の情報
- 環境情報（OS, Node.js バージョン）
- 再現手順
- 期待する動作
- 実際の動作
- エラーメッセージ（あれば）

## コードレビュー

プルリクエストは以下の点を確認します：
- コードの品質と可読性
- テストの追加・更新
- ドキュメントの更新
- セキュリティの考慮
- パフォーマンスへの影響

## ライセンス

このプロジェクトに貢献することで、あなたの貢献がプロジェクトのライセンスの下で公開されることに同意するものとします。