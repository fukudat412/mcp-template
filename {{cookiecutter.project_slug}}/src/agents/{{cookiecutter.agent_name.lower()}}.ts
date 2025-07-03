import { BaseAgent } from './baseAgent';
import { MCPInput, MCPOutput } from '../types';
{% if cookiecutter.include_llm_integration == "openai" %}import OpenAI from 'openai';{% endif %}
{% if cookiecutter.include_llm_integration == "claude" %}import Anthropic from '@anthropic-ai/sdk';{% endif %}

export class {{ cookiecutter.agent_class_name }} extends BaseAgent {
{% if cookiecutter.include_llm_integration == "openai" %}  private openai: OpenAI;
{% endif %}{% if cookiecutter.include_llm_integration == "claude" %}  private anthropic: Anthropic;
{% endif %}
  constructor() {
    super('{{ cookiecutter.agent_class_name }}');
{% if cookiecutter.include_llm_integration == "openai" %}    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });{% endif %}
{% if cookiecutter.include_llm_integration == "claude" %}    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY
    });{% endif %}
  }

  async processInput(input: MCPInput): Promise<MCPOutput> {
{% if cookiecutter.include_llm_integration == "openai" %}    // OpenAI GPT を使用した処理
    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'user', content: input.input as string }
      ]
    });

    return {
      sessionId: input.sessionId,
      output: response.choices[0].message.content || '',
      tokenUsage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      },
      latencyMs: 0, // BaseAgentが自動設定
      agent: this.agentName
    };
{% elif cookiecutter.include_llm_integration == "claude" %}    // Claude を使用した処理
    const response = await this.anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [
        { role: 'user', content: input.input as string }
      ]
    });

    return {
      sessionId: input.sessionId,
      output: response.content[0].text,
      tokenUsage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens
      },
      latencyMs: 0, // BaseAgentが自動設定
      agent: this.agentName
    };
{% else %}    // カスタム処理の実装
    // TODO: ここに具体的な処理ロジックを実装してください
    const processedOutput = typeof input.input === 'string' 
      ? `${input.input}_processed_by_${this.agentName}`
      : { ...input.input, processedBy: this.agentName };

    return {
      sessionId: input.sessionId,
      output: processedOutput,
      tokenUsage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      },
      latencyMs: 0, // BaseAgentが自動設定
      agent: this.agentName
    };
{% endif %}
  }
}