import { getVersionInfo } from '../../utils/version';

describe('Version utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return version info from package.json', () => {
    const version = getVersionInfo();

    expect(version.name).toBe('mcp-agent');
    expect(version.version).toBe('1.2.0');
    expect(version.description).toBe('MCP Agent Service');
    expect(version.nodeVersion).toBe(process.version);
    expect(version.buildDate).toBeDefined();
    expect(version.gitCommit).toBeDefined();
  });

  it('should use environment variables for build info', () => {
    process.env.BUILD_DATE = '2025-01-01T00:00:00Z';
    process.env.GIT_COMMIT = 'abc123';

    // Clear cache
    jest.resetModules();
    const { getVersionInfo } = require('../../utils/version');
    
    const version = getVersionInfo();

    expect(version.buildDate).toBe('2025-01-01T00:00:00Z');
    expect(version.gitCommit).toBe('abc123');
  });

  it('should return fallback values if package.json is not found', () => {
    // Mock readFileSync to throw error
    jest.mock('fs', () => ({
      readFileSync: jest.fn().mockImplementation(() => {
        throw new Error('File not found');
      })
    }));

    jest.resetModules();
    const { getVersionInfo } = require('../../utils/version');
    
    const version = getVersionInfo();

    expect(version.version).toBe('1.2.0');
    expect(version.name).toBe('mcp-agent');
    expect(version.gitCommit).toBe('unknown');
  });
});