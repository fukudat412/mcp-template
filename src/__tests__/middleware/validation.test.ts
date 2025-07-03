import { Request, Response } from 'express';
import { validateInput } from '../../middleware/validation';

describe('validateInput middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should pass validation with valid input', () => {
    mockReq.body = {
      sessionId: 'test-123',
      input: 'test input'
    };

    validateInput(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should pass validation with object input', () => {
    mockReq.body = {
      sessionId: 'test-123',
      input: { data: 'test' }
    };

    validateInput(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should pass validation with meta data', () => {
    mockReq.body = {
      sessionId: 'test-123',
      input: 'test',
      meta: {
        userId: 'user123',
        sourceFile: 'test.txt',
        customField: 'value'
      }
    };

    validateInput(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should fail validation without sessionId', () => {
    mockReq.body = {
      input: 'test input'
    };

    validateInput(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Invalid input',
      details: expect.arrayContaining([expect.stringContaining('sessionId')])
    });
  });

  it('should fail validation without input', () => {
    mockReq.body = {
      sessionId: 'test-123'
    };

    validateInput(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Invalid input',
      details: expect.arrayContaining([expect.stringContaining('input')])
    });
  });

  it('should fail validation with invalid input type', () => {
    mockReq.body = {
      sessionId: 'test-123',
      input: 123 // number is not allowed
    };

    validateInput(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
});