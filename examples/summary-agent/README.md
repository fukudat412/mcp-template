# Summary Agent - テキスト要約エージェント

長いテキストや文書を簡潔にまとめるMCPエージェントです。

## 🎯 機能

- **テキスト要約**: 長文を指定された長さに要約
- **キーポイント抽出**: 重要なポイントを箇条書きで抽出
- **多言語対応**: 日本語・英語の要約に対応
- **フォーマット対応**: プレーンテキスト・Markdown出力

## 🚀 使用方法

### セットアップ

```bash
cd examples/summary-agent
npm install
cp .env.example .env
# .envファイルを編集してAPIキーを設定
npm run dev
```

### API呼び出し

```bash
curl -X POST http://localhost:3000/summary-process \
  -H "x-api-key: development-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "summary-001",
    "input": "要約したい長いテキストをここに...",
    "meta": {
      "language": "ja",
      "maxLength": 300,
      "format": "bullets"
    }
  }'
```

### レスポンス例

```json
{
  "sessionId": "summary-001",
  "output": {
    "summary": "本文の要約がここに表示されます。主要なポイントが簡潔にまとめられています。",
    "keyPoints": [
      "重要なポイント1",
      "重要なポイント2", 
      "重要なポイント3"
    ],
    "originalLength": 2500,
    "summaryLength": 127,
    "compressionRatio": 0.95
  },
  "tokenUsage": {
    "promptTokens": 850,
    "completionTokens": 200,
    "totalTokens": 1050
  },
  "latencyMs": 1500,
  "agent": "SummaryAgent"
}
```

## ⚙️ 設定オプション

### 環境変数

```bash
# .env
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4
SUMMARY_MAX_LENGTH=500
SUMMARY_LANGUAGE=ja
SUMMARY_STYLE=formal
```

### メタパラメータ

| パラメータ | 型 | デフォルト | 説明 |
|----------|---|----------|------|
| `maxLength` | number | 300 | 要約の最大文字数 |
| `language` | string | "ja" | 出力言語 (ja/en) |
| `format` | string | "paragraph" | 出力形式 (paragraph/bullets/structured) |
| `style` | string | "formal" | 文体 (formal/casual/academic) |
| `focusAreas` | string[] | [] | 重点的に要約する分野 |

## 🎨 カスタマイズ

### プロンプトの変更

```typescript
// src/prompts/summary.ts
export const SUMMARY_PROMPT = `
あなたは専門的な要約エージェントです。
以下の条件で文書を要約してください：

条件:
- 最大{{maxLength}}文字
- 言語: {{language}}
- 形式: {{format}}
- 文体: {{style}}

文書:
{{text}}

要約:
`;
```

### カスタムフォーマッター

```typescript
export class CustomSummaryAgent extends SummaryAgent {
  protected formatOutput(summary: string, keyPoints: string[]): any {
    return {
      executive_summary: summary,
      key_insights: keyPoints,
      action_items: this.extractActionItems(summary),
      next_steps: this.suggestNextSteps(summary)
    };
  }
}
```

## 📊 パフォーマンス

### ベンチマーク

| 文書サイズ | 処理時間 | トークン使用量 | 精度スコア |
|----------|---------|-------------|----------|
| 1,000文字 | 800ms | 450 tokens | 4.2/5.0 |
| 5,000文字 | 1,500ms | 1,200 tokens | 4.4/5.0 |
| 10,000文字 | 2,800ms | 2,500 tokens | 4.3/5.0 |

### 最適化のヒント

```typescript
// チャンク分割による大文書対応
export class ChunkedSummaryAgent extends SummaryAgent {
  async processLargeDocument(text: string): Promise<string> {
    const chunks = this.splitIntoChunks(text, 2000);
    const chunkSummaries = await Promise.all(
      chunks.map(chunk => this.summarizeChunk(chunk))
    );
    return this.mergeSummaries(chunkSummaries);
  }
}
```

## 🧪 テスト

```bash
# 単体テスト
npm test

# 精度テスト
npm run test:accuracy

# パフォーマンステスト
npm run test:performance

# エンドツーエンドテスト
npm run test:e2e
```

## 📋 実用例

### ニュース記事の要約

```javascript
const newsInput = {
  sessionId: "news-001",
  input: "今日の経済ニュース...",
  meta: {
    maxLength: 200,
    format: "bullets",
    focusAreas: ["株価", "金融政策", "企業決算"]
  }
};
```

### 会議録の要約

```javascript
const meetingInput = {
  sessionId: "meeting-001", 
  input: "会議の議事録...",
  meta: {
    format: "structured",
    style: "formal",
    focusAreas: ["決定事項", "課題", "次回アクション"]
  }
};
```

### 学術論文の要約

```javascript
const paperInput = {
  sessionId: "paper-001",
  input: "論文のアブストラクト...",
  meta: {
    maxLength: 500,
    style: "academic",
    format: "structured"
  }
};
```

---

**[← 戻る](../README.md)** | **[メインテンプレート →](../../)**