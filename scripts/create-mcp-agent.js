#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

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

  // Get basic project details
  const projectName = await prompt('プロジェクト名を入力してください: ');
  if (!projectName) {
    log(colors.red, 'プロジェクト名は必須です');
    process.exit(1);
  }

  const description = await prompt('プロジェクトの説明を入力してください: ') || 'MCP Agent Service';
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

    // Remove examples and docs to simplify
    log(colors.blue, '不要なファイルを削除中...');
    if (fs.existsSync('examples')) {
      fs.rmSync('examples', { recursive: true, force: true });
    }
    if (fs.existsSync('scripts')) {
      fs.rmSync('scripts', { recursive: true, force: true });
    }
    if (fs.existsSync('.github/workflows/pages.yml')) {
      fs.rmSync('.github/workflows/pages.yml', { force: true });
    }

    // Update package.json
    log(colors.blue, 'package.json を更新中...');
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    packageJson.name = projectName;
    packageJson.description = description;
    packageJson.author = `${authorName} <${authorEmail}>`;
    
    // Remove bin section
    delete packageJson.bin;
    
    // Update repository info if provided
    if (authorName !== 'Your Name') {
      packageJson.repository.url = `git+https://github.com/${authorName}/${projectName}.git`;
      packageJson.bugs.url = `https://github.com/${authorName}/${projectName}/issues`;
      packageJson.homepage = `https://github.com/${authorName}/${projectName}#readme`;
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

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
    log(colors.yellow, 'カスタマイズ:');
    log(colors.blue, '  src/agents/sampleAgent.ts - エージェントロジック');
    log(colors.blue, '  docs/ - 詳細なドキュメント');

  } catch (error) {
    log(colors.red, `エラー: ${error.message}`);
    process.exit(1);
  }
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
  // Secure random key generation
  return crypto.randomBytes(32).toString('hex');
}

// Execute
if (require.main === module) {
  createMcpAgent().catch(console.error);
}

module.exports = { createMcpAgent };