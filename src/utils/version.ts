import { readFileSync } from 'fs';
import { join } from 'path';

export interface VersionInfo {
  version: string;
  name: string;
  description: string;
  buildDate: string;
  nodeVersion: string;
  gitCommit?: string;
}

let versionInfo: VersionInfo | null = null;

export const getVersionInfo = (): VersionInfo => {
  if (versionInfo) {
    return versionInfo;
  }

  try {
    const packageJsonPath = join(__dirname, '../../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    
    versionInfo = {
      version: packageJson.version,
      name: packageJson.name,
      description: packageJson.description,
      buildDate: process.env.BUILD_DATE || new Date().toISOString(),
      nodeVersion: process.version,
      gitCommit: process.env.GIT_COMMIT || 'unknown'
    };

    return versionInfo;
  } catch (error) {
    // Fallback version info
    return {
      version: '1.2.0',
      name: 'mcp-agent',
      description: 'MCP Agent Service',
      buildDate: new Date().toISOString(),
      nodeVersion: process.version,
      gitCommit: 'unknown'
    };
  }
};