import { describe, it, expect } from 'vitest';
import { ApiError } from '../../../src/utils/errors/ApiError'; // Ensure this path is correct

describe('ApiError', () => {
    it('should create an instance of ApiError with the correct properties', () => {
        const message = 'Not Found';
        const statusCode = 404;
        const isOperational = true;

        const error = new ApiError(message, statusCode, isOperational);

        expect(error).toBeInstanceOf(ApiError);
        expect(error.message).toBe(message);
        expect(error.statusCode).toBe(statusCode);
        expect(error.isOperational).toBe(isOperational);
    });

    it('should default isOperational to true if not provided', () => {
        const message = 'Internal Server Error';
        const statusCode = 500;

        const error = new ApiError(message, statusCode);

        expect(error.isOperational).toBe(true);
    });

    it('should capture the stack trace', () => {
        const message = 'Bad Request';
        const statusCode = 400;

        const error = new ApiError(message, statusCode);

        expect(error.stack).toBeDefined();
    });
});