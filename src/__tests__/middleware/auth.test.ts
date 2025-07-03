import { Request, Response } from 'express';
import { authenticateApiKey } from '../../middleware/auth';

describe('authenticateApiKey middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  const originalEnv = process.env;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should pass authentication with valid API key', () => {
    process.env.API_KEY = 'test-key-123';
    mockReq.headers = { 'x-api-key': 'test-key-123' };

    authenticateApiKey(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should use default key in development', () => {
    delete process.env.API_KEY;
    mockReq.headers = { 'x-api-key': 'development-key' };

    authenticateApiKey(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should reject request without API key', () => {
    mockReq.headers = {};

    authenticateApiKey(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'API key required' });
  });

  it('should reject request with invalid API key', () => {
    process.env.API_KEY = 'test-key-123';
    mockReq.headers = { 'x-api-key': 'wrong-key' };

    authenticateApiKey(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
  });
});