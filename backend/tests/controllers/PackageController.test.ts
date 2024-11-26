import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { PackageController } from '../../src/controllers/PackageController.js';
import { PackageUploadService } from '../../src/services/PackageUploadService.js';
import { PackageGetterService } from '../../src/services/PackageGetterService.js';
import { ApiError } from '../../src/utils/errors/ApiError.js';

describe('PackageController', () => {
    describe('getPackages', () => {
        it('should return results when queries are provided', async () => {
            const req = {
                body: [{ query: 'test' }]
            } as Request;
            const res = {
                json: vi.fn()
            } as unknown as Response;
            const next = vi.fn() as NextFunction;

            vi.spyOn(PackageGetterService, 'queryPackages').mockResolvedValue([{ id: 1, name: 'testPackage', version: '1.0.0' }]);

            await PackageController.getPackages(req, res, next);

            expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'testPackage', version: '1.0.0' }]);
        });

        it('should call next with an error when no queries are provided', async () => {
            const req = {
                body: null
            } as Request;
            const res = {} as Response;
            const next = vi.fn() as NextFunction;

            await PackageController.getPackages(req, res, next);

            expect(next).toHaveBeenCalledWith(new ApiError('No queries provided.', 400));
        });
    });

    describe('resetRegistry', () => {
        it('should return a success message', async () => {
            const req = {} as Request;
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            } as unknown as Response;

            await PackageController.resetRegistry(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'DELETE /reset' });
        });
    });

    describe('getPackage', () => {
        it('should return a success message when id is provided', async () => {
            const req = {
                params: { id: '123' }
            } as unknown as Request;
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            } as unknown as Response;

            await PackageController.getPackage(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'GET /:id' });
        });

        it('should return a bad request message when id is not provided', async () => {
            const req = {
                params: { id: '' }
            } as unknown as Request;
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            } as unknown as Response;

            await PackageController.getPackage(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Bad Request' });
        });
    });

    describe('updatePackage', () => {
        it('should return a success message', async () => {
            const req = {} as Request;
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            } as unknown as Response;

            await PackageController.updatePackage(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'PUT /:id' });
        });
    });

    describe('uploadPackage', () => {
        it('should process Content package and return result', async () => {
            const req = {
                body: { Content: 'testContent', JSProgram: 'testProgram', debloat: true }
            } as Request;
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            } as unknown as Response;
            const next = vi.fn() as NextFunction;

            vi.spyOn(PackageUploadService, 'uploadContentType').mockResolvedValue({
                metadata: { Name: 'testPackage', Version: '1.0.0', ID: 1 },
                data: { Content: 'testContent', JSProgram: 'testProgram' }
            });

            await PackageController.uploadPackage(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                metadata: { Name: 'testPackage', Version: '1.0.0', ID: 1 },
                data: { Content: 'testContent', JSProgram: 'testProgram' }
            });
        });

        it('should process URL package and return result', async () => {
            const req = {
                body: { URL: 'http://test.com', JSProgram: 'testProgram' }
            } as Request;
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            } as unknown as Response;
            const next = vi.fn() as NextFunction;

            vi.spyOn(PackageUploadService, 'uploadURLType').mockResolvedValue({
                metadata: { Name: 'testPackage', Version: '1.0.0', ID: 1 },
                data: { Content: undefined, JSProgram: 'testProgram' }
            });

            await PackageController.uploadPackage(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ result: 'test' });
        });

        it('should call next with an error when package data is improperly formatted', async () => {
            const req = {
                body: { Content: 'testContent', URL: 'http://test.com' }
            } as Request;
            const res = {} as Response;
            const next = vi.fn() as NextFunction;

            await PackageController.uploadPackage(req, res, next);

            expect(next).toHaveBeenCalledWith(new ApiError('Package data is formatted improperly.', 400));
        });
    });

    describe('getPackageRating', () => {
        it('should return a success message', async () => {
            const req = {} as Request;
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            } as unknown as Response;

            await PackageController.getPackageRating(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'GET /:id/rate' });
        });
    });

    describe('getPackageCost', () => {
        it('should return a success message', async () => {
            const req = {} as Request;
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            } as unknown as Response;

            await PackageController.getPackageCost(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'GET /:id/cost' });
        });
    });

    describe('getPackagesByRegEx', () => {
        it('should return a success message', async () => {
            const req = {} as Request;
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            } as unknown as Response;

            await PackageController.getPackagesByRegEx(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'GET /byRegEx' });
        });
    });
});