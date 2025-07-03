実装指示仕様書：MCPエージェント開発ガイド

1. 目的とゴール

本実装は、MCP（Multi-agent Control Platform）型アーキテクチャに基づくAIエージェントを実装することを目的とする。
本エージェントは 「〇〇の処理（例：PDF要約、CSV分類など）」 を担当し、疎結合なMCP構成の中で再利用可能であることを前提とする。

⸻

2. 入出力仕様（JSONスキーマ）

入力

{
  "sessionId": "string (必須)",
  "input": "string または object",
  "meta": {
    "userId": "string",
    "sourceFile": "string",
    ... // 任意
  }
}

出力

{
  "sessionId": "string",
  "output": "string または object",
  "tokenUsage": {
    "promptTokens": number,
    "completionTokens": number,
    "totalTokens": number
  },
  "latencyMs": number,
  "agent": "AgentName"
}


⸻

3. 使用する技術スタック
	•	Node.js or Python（用途に応じて選択）
	•	Express.js / FastAPI を使用したAPI構成
	•	OpenAI / Claude / Mistral など LLM API（LLM使用時）
	•	Docker でコンテナ化
	•	JSONベースのログ出力（stdout）

⸻

4. ログと可視化要件
	•	すべての処理に対してセッションID付きでログを出力する
	•	ログ出力例（JSON形式）

{
  "timestamp": "2025-07-03T12:00:00Z",
  "sessionId": "abc-123",
  "agent": "SummaryAgent",
  "inputLength": 234,
  "outputLength": 112,
  "latencyMs": 1400,
  "tokenUsage": {
    "promptTokens": 200,
    "completionTokens": 100,
    "totalTokens": 300
  },
  "error": null
}

	•	エラー発生時は必ず error フィールドにエラーメッセージとスタックトレースを含めること

⸻

5. セキュリティと制限事項
	•	PII（個人情報）が含まれる可能性があるため、ログに生のテキストは出力しない（hash化 or サマリ化）
	•	外部との通信は指定されたLLM/APIエンドポイントのみに制限する
	•	APIは認証トークン制（X-API-KEYヘッダー）でアクセス制限をかける（開発時はstubでOK）

⸻

6. 開発手順と注意事項

✅ スタブ開発可
	•	LLM呼び出しや外部APIは最初はstub化して良い
	•	mockで output = input + '_processed' 程度のものを返す

✅ 単体テスト必須
	•	最低限、以下のケースをカバー：
	•	正常処理（input → output）
	•	無効な入力（例：null、文字列型を期待して配列が来るなど）
	•	API障害（LLMタイムアウトなど）

✅ パフォーマンス目安
	•	1リクエストあたり最大5秒以内で応答するよう設計
	•	同時実行数：10req/sec に耐える作り（非同期処理必須）

⸻

7. その他補足
	•	promptのバージョンはコードベースで管理する（例：prompts/v1/summary.txt）
	•	agent名は固定の文字列として明示する（例：SummaryAgent）
	•	将来的にMCP→MCP構成になることを想定して、sessionIdの伝播を前提とする
	•	すべてのログに logStage（例：“received”, “processed”, “error”）を含めてもよい

⸻

以上を満たす構成で、再利用性・可視性・セキュリティを保ったMCPエージェントを構築すること。
