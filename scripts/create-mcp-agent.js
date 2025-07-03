#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function prompt(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function createMcpAgent() {
  log(colors.bold + colors.blue, '🚀 MCP Agent Creator');
  console.log();

  // Get project details
  const projectName = await prompt('プロジェクト名を入力してください: ');
  if (!projectName) {
    log(colors.red, 'プロジェクト名は必須です');
    process.exit(1);
  }

  const description = await prompt('プロジェクトの説明を入力してください: ') || 'MCP Agent Service';
  const agentName = await prompt('エージェント名を入力してください (例: SummaryAgent): ') || 'CustomAgent';
  const authorName = await prompt('作成者名を入力してください: ') || 'Your Name';
  const authorEmail = await prompt('作成者のメールアドレスを入力してください: ') || 'your.email@example.com';

  console.log();
  log(colors.yellow, '📁 プロジェクトを作成中...');

  // Create project directory
  const projectDir = path.join(process.cwd(), projectName);
  if (fs.existsSync(projectDir)) {
    log(colors.red, `エラー: ディレクトリ ${projectName} は既に存在します`);
    process.exit(1);
  }

  try {
    // Clone template
    log(colors.blue, 'テンプレートをクローン中...');
    execSync(`git clone https://github.com/fukudat412/mcp-template.git ${projectName}`, { stdio: 'pipe' });

    // Navigate to project directory
    process.chdir(projectDir);

    // Remove .git directory
    if (fs.existsSync('.git')) {
      fs.rmSync('.git', { recursive: true, force: true });
    }

    // Update package.json
    log(colors.blue, 'package.json を更新中...');
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    packageJson.name = projectName;
    packageJson.description = description;
    packageJson.author = `${authorName} <${authorEmail}>`;
    packageJson.repository.url = `git+https://github.com/${authorName}/${projectName}.git`;
    packageJson.bugs.url = `https://github.com/${authorName}/${projectName}/issues`;
    packageJson.homepage = `https://github.com/${authorName}/${projectName}#readme`;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Create custom agent
    if (agentName !== 'SampleAgent') {
      log(colors.blue, `カスタムエージェント ${agentName} を作成中...`);
      createCustomAgent(agentName);
    }

    // Create .env file
    log(colors.blue, '.env ファイルを作成中...');
    const envContent = `PORT=3000
API_KEY=${generateApiKey()}
LOG_LEVEL=info
NODE_ENV=development

# LLM API Keys (必要に応じて設定)
# OPENAI_API_KEY=sk-...
# CLAUDE_API_KEY=...
`;
    fs.writeFileSync('.env', envContent);

    // Update README
    log(colors.blue, 'README を更新中...');
    updateReadme(projectName, description);

    // Initialize git
    log(colors.blue, 'Git リポジトリを初期化中...');
    execSync('git init', { stdio: 'pipe' });

    // Install dependencies
    log(colors.blue, '依存関係をインストール中...');
    execSync('npm install', { stdio: 'pipe' });

    // Run tests
    log(colors.blue, 'テストを実行中...');
    execSync('npm test', { stdio: 'pipe' });

    console.log();
    log(colors.green + colors.bold, '✅ プロジェクトが正常に作成されました！');
    console.log();
    log(colors.green, '次のステップ:');
    log(colors.blue, `  cd ${projectName}`);
    log(colors.blue, '  npm run dev');
    console.log();
    log(colors.yellow, '動作確認:');
    log(colors.blue, '  curl http://localhost:3000/health');
    console.log();
    log(colors.yellow, 'ドキュメント:');
    log(colors.blue, '  README.md - プロジェクト概要');
    log(colors.blue, '  CLAUDE.md - 開発ガイド');
    log(colors.blue, '  CONTRIBUTING.md - 貢献ガイド');

  } catch (error) {
    log(colors.red, `エラー: ${error.message}`);
    process.exit(1);
  }
}

function createCustomAgent(agentName) {
  const agentPath = path.join('src', 'agents', `${agentName.toLowerCase()}.ts`);
  const agentContent = `import { BaseAgent } from './baseAgent';
import { MCPInput, MCPOutput } from '../types';

export class ${agentName} extends BaseAgent {
  constructor() {
    super('${agentName}');
  }

  async processInput(input: MCPInput): Promise<MCPOutput> {
    // TODO: カスタム処理を実装してください
    // 例: LLM API呼び出し、データ処理、外部API連携など
    
    const processedOutput = typeof input.input === 'string' 
      ? \`\${input.input}_processed_by_\${this.agentName}\`
      : { ...input.input, processedBy: this.agentName };

    return {
      sessionId: input.sessionId,
      output: processedOutput,
      tokenUsage: {
        promptTokens: 0,  // LLM使用時に実際の値を設定
        completionTokens: 0,
        totalTokens: 0
      },
      latencyMs: 0, // BaseAgentが自動設定
      agent: this.agentName
    };
  }
}
`;

  fs.writeFileSync(agentPath, agentContent);

  // Update index.ts to include new agent
  const indexPath = path.join('src', 'index.ts');
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Add import
  const importLine = `import { ${agentName} } from './agents/${agentName.toLowerCase()}';`;
  indexContent = indexContent.replace(
    "import { SampleAgent } from './agents/sampleAgent';",
    `import { SampleAgent } from './agents/sampleAgent';\n${importLine}`
  );

  // Add agent instance
  const instanceLine = `const ${agentName.toLowerCase()} = new ${agentName}();`;
  indexContent = indexContent.replace(
    'const sampleAgent = new SampleAgent();',
    `const sampleAgent = new SampleAgent();\n${instanceLine}`
  );

  // Add endpoint
  const endpointCode = `
// ${agentName} endpoint
app.post('/${agentName.toLowerCase()}-process', authenticateApiKey, validateInput, async (req: Request, res: Response) => {
  const input: MCPInput = req.body;

  try {
    const output = await ${agentName.toLowerCase()}.execute(input);
    res.json(output);
  } catch (error) {
    logger.error('Processing error:', error);
    res.status(500).json({
      error: 'Processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
`;

  indexContent = indexContent.replace(
    '// Main processing endpoint',
    `// Main processing endpoint${endpointCode}`
  );

  fs.writeFileSync(indexPath, indexContent);
}

function updateReadme(projectName, description) {
  const readmePath = 'README.md';
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  readmeContent = readmeContent.replace(
    '# MCP Agent Service Template',
    `# ${projectName}`
  );
  
  readmeContent = readmeContent.replace(
    'MCPアーキテクチャに基づくAIエージェントサービスのテンプレートリポジトリです。',
    description
  );

  fs.writeFileSync(readmePath, readmeContent);
}

function generateApiKey() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Execute
if (require.main === module) {
  createMcpAgent().catch(console.error);
}

module.exports = { createMcpAgent };