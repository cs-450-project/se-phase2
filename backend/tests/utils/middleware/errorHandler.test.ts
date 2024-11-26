import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../../src/utils/middleware/errorHandler';
import { ApiError } from '../../../src/utils/errors/ApiError.js';

describe('errorHandler middleware', () => {
    it('should handle ApiError with status code and message', () => {
        const err = new ApiError('Test error', 400);
        const req = {} as Request;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;
        const next = vi.fn() as NextFunction;

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            statusCode: 400,
            message: 'Test error',
        });
    });

    it('should log the error message', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const err = new ApiError('Test error', 400);
        const req = {} as Request;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;
        const next = vi.fn() as NextFunction;

        errorHandler(err, req, res, next);

        expect(consoleSpy).toHaveBeenCalledWith('[ERROR] Test error');
        consoleSpy.mockRestore();
    });
});