import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError.js';

export const errorHandler = (
    err: ApiError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log the error
    console.error(`[ERROR] ${message}`);

    // Send the response
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
    });
}