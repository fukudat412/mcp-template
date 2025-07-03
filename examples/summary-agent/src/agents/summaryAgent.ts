import { BaseAgent } from '../../../../src/agents/baseAgent';
import { MCPInput, MCPOutput } from '../../../../src/types';
import OpenAI from 'openai';

interface SummaryMeta {
  maxLength?: number;
  language?: 'ja' | 'en';
  format?: 'paragraph' | 'bullets' | 'structured';
  style?: 'formal' | 'casual' | 'academic';
  focusAreas?: string[];
}

interface SummaryOutput {
  summary: string;
  keyPoints: string[];
  originalLength: number;
  summaryLength: number;
  compressionRatio: number;
}

export class SummaryAgent extends BaseAgent {
  private openai: OpenAI;

  constructor() {
    super('SummaryAgent');
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async processInput(input: MCPInput): Promise<MCPOutput> {
    const text = input.input as string;
    const meta: SummaryMeta = input.meta || {};
    
    const maxLength = meta.maxLength || parseInt(process.env.SUMMARY_MAX_LENGTH || '300');
    const language = meta.language || process.env.SUMMARY_LANGUAGE || 'ja';
    const format = meta.format || 'paragraph';
    const style = meta.style || 'formal';
    const focusAreas = meta.focusAreas || [];

    const prompt = this.buildPrompt(text, {
      maxLength,
      language,
      format,
      style,
      focusAreas
    });

    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: 'あなたは専門的な要約エージェントです。指定された条件に従って正確で簡潔な要約を作成してください。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: Math.min(maxLength * 2, 2000)
    });

    const summaryText = response.choices[0].message.content || '';
    const output = this.parseSummaryResponse(summaryText, text);

    return {
      sessionId: input.sessionId,
      output,
      tokenUsage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      },
      latencyMs: 0, // BaseAgentが自動設定
      agent: this.agentName
    };
  }

  private buildPrompt(text: string, options: {
    maxLength: number;
    language: string;
    format: string;
    style: string;
    focusAreas: string[];
  }): string {
    const { maxLength, language, format, style, focusAreas } = options;
    
    let formatInstruction = '';
    switch (format) {
      case 'bullets':
        formatInstruction = '箇条書き（•）形式で出力してください。';
        break;
      case 'structured':
        formatInstruction = '以下の構造で出力してください：\\n概要:\\n主要ポイント:\\n結論：';
        break;
      default:
        formatInstruction = '段落形式で出力してください。';
    }

    let styleInstruction = '';
    switch (style) {
      case 'casual':
        styleInstruction = 'カジュアルで親しみやすい文体で書いてください。';
        break;
      case 'academic':
        styleInstruction = '学術的で正確な文体で書いてください。';
        break;
      default:
        styleInstruction = 'フォーマルで礼儀正しい文体で書いてください。';
    }

    const focusInstruction = focusAreas.length > 0 
      ? `特に以下の分野に重点を置いてください: ${focusAreas.join(', ')}`
      : '';

    return `
以下の文書を要約してください。

条件:
- 最大${maxLength}文字
- 言語: ${language === 'ja' ? '日本語' : '英語'}
- ${formatInstruction}
- ${styleInstruction}
${focusInstruction}

また、要約とは別に、重要なポイントを3-5個の箇条書きで抽出してください。

文書:
${text}

回答形式:
要約: [ここに要約を記載]

重要ポイント:
• [ポイント1]
• [ポイント2]
• [ポイント3]
`;
  }

  private parseSummaryResponse(response: string, originalText: string): SummaryOutput {
    const lines = response.split('\\n').filter(line => line.trim());
    
    let summary = '';
    const keyPoints: string[] = [];
    let inSummary = false;
    let inKeyPoints = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('要約:')) {
        inSummary = true;
        inKeyPoints = false;
        summary = trimmed.replace('要約:', '').trim();
        continue;
      }
      
      if (trimmed.includes('重要ポイント') || trimmed.includes('主要ポイント')) {
        inSummary = false;
        inKeyPoints = true;
        continue;
      }
      
      if (inSummary && trimmed) {
        summary += ' ' + trimmed;
      }
      
      if (inKeyPoints && trimmed.startsWith('•')) {
        keyPoints.push(trimmed.replace('•', '').trim());
      }
    }

    // フォールバック: 構造化されていない場合は全体を要約として扱う
    if (!summary && !keyPoints.length) {
      const parts = response.split('\\n\\n');
      summary = parts[0] || response;
      
      // 箇条書きを探してキーポイントとして抽出
      const bulletPattern = /^[•・-]\\s*(.+)$/gm;
      let match;
      while ((match = bulletPattern.exec(response)) !== null) {
        keyPoints.push(match[1]);
      }
    }

    const originalLength = originalText.length;
    const summaryLength = summary.length;
    const compressionRatio = 1 - (summaryLength / originalLength);

    return {
      summary: summary.trim(),
      keyPoints,
      originalLength,
      summaryLength,
      compressionRatio: Math.round(compressionRatio * 100) / 100
    };
  }
}