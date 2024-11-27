/**
 * @file PackageController.ts
 * Controller handles HTTP requests for package management endpoints.
 * Processes requests, delegates to services, and returns responses.
 */

import { Request, Response, NextFunction } from 'express';
import { PackageUploadService } from '../services/PackageUploadService.js';
import { PackageGetterService } from '../services/PackageGetterService.js';
import { PackageUpdateService } from '../services/PackageUpdateService.js';
import { PackageQuery } from '../utils/types/PackageQuery.js';
import { ApiError } from '../utils/errors/ApiError.js';

/**
 * @class PackageController
 * Processes package-related HTTP requests and returns appropriate responses.
 * Handles package uploads, queries, updates, and deletions.
 */
export class PackageController {
    /**
     * Processes POST /packages request to query multiple packages
     * @param req Express request containing array of package queries
     * @param res Express response
     * @param next Next middleware function
     * @throws ApiError if query format is invalid
     */
    static async getPackagesFromQueries(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('[PackageController] Processing POST /packages request');
            const queries: PackageQuery[] = req.body;
            
            if (!queries || !Array.isArray(queries)) {
                throw new ApiError('Invalid query format: Expected array of package queries', 400);
            }

            const results = await PackageGetterService.queryPackages(queries);
            res.status(200).json(results);

        } catch (error) {
            console.error('[PackageController] Failed to process package queries:', error);
            next(error);
        }
    }
    
    /**
     * Processes DELETE /reset request to reset the registry
     * @param req Express request
     * @param res Express response
     * @param next Next middleware function
     * @param next Next middleware function
     */
    static async resetRegistry(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('[PackageController] Processing DELETE /reset request');
            // TODO: Implement registry reset logic
            res.status(200).json({ message: 'Registry reset successful' });
        } catch (error) {
            console.error('[PackageController] Failed to reset registry:', error);
            next(error);
        }
    }

    /**
     * Processes GET /:id request to fetch a specific package
     * @param req Express request containing package ID
     * @param res Express response
     * @throws ApiError if package ID is invalid or not found
     */
    static async getPackage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            console.log(`[PackageController] Processing GET /${id} request`);

            if (!id) {
                throw new ApiError('Package ID is required', 400);
            }

            const result = await PackageGetterService.getPackageMetadataAndDataById(parseInt(id));

            res.status(200).json(result);

        } catch (error) {
            console.error('[PackageController] Failed to fetch package:', error);
            next(error);
        }
    }

    /**
     * Processes PUT /:id request to update a package
     * @param req Express request containing package ID and update data
     * @param res Express response
     * @throws ApiError if update fails
     */
    static async updatePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            
            // Destructure package ID from request parameters
            const { id } = req.params;

            // Destructure metadata and data objects from request body
            const { metadata, data } = req.body;

            // Destructure metadata and data objects
            const { Name: metaName, Version: version, ID: pkgId } = metadata;
            const { Name: dataName, Content: content, URL: url, debloat, JSProgram: jsProgram } = data;

            if (!id || id !== pkgId) {
                throw new ApiError('Package ID is required and must match metadata ID', 400);
            }
            if (metaName !== dataName) {
                throw new ApiError('Metadata and data names must match', 400);
            }

            if ((content && !url) || (!content && url)) {
                
            }

            console.log(`[PackageController] Processing POST /package/${id} request`);


            // TODO: Implement package update logic
            res.status(200).json({ message: `Package ${id} updated` });

        } catch (error) {
            console.error('[PackageController] Failed to update package:', error);
            next(error);
        }
    }

    /**
     * Processes POST /package request to upload a new package
     * @param req Express request containing package content or URL
     * @param res Express response
     * @param next Next middleware function
     * @throws ApiError if package data is invalid or upload fails
     */
    static async uploadPackage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('[PackageController] Processing POST /package request');
            const { Content, URL, JSProgram, debloat } = req.body;

            if (Content && !URL) {
                console.log('[PackageController] Processing Content upload');
                const result = await PackageUploadService.uploadContentType(Content, JSProgram, debloat);
                res.status(200).json(result);
                return;
            }
            
            if (URL && !Content) {
                console.log('[PackageController] Processing URL upload');
                const result = await PackageUploadService.uploadUrlType(URL, JSProgram);
                res.status(200).json(result);
                return;
            }

            throw new ApiError('Invalid package data: Provide either Content or URL, not both', 400);

        } catch (error) {
            console.error('[PackageController] Package upload failed:', error);
            next(error);
        }
    }

    /**
     * Processes GET /:id/rate request to get package rating
     * @param req Express request containing package ID
     * @param res Express response
     * @throws ApiError if rating cannot be retrieved
     */
    static async getPackageRating(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            console.log(`[PackageController] Processing GET /${id}/rate request`);

            if (!id) {
                throw new ApiError('Package ID is required', 400);
            }

            const result = await PackageGetterService.getPackageRatingFromId(parseInt(id));
            // TODO: Implement rating fetch logic
            res.status(200).json(result);

        } catch (error) {
            console.error('[PackageController] Failed to fetch package rating:', error);
            throw new ApiError('Failed to fetch package rating', error instanceof ApiError ? error.statusCode : 500);
        }
    }

    /**
     * Processes GET /:id/cost request to get package cost metrics
     * @param req Express request containing package ID
     * @param res Express response
     * @throws ApiError if cost metrics cannot be retrieved
     */
    static async getPackageCost(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            console.log(`[PackageController] Processing GET /${id}/cost request`);

            if (!id) {
                throw new ApiError('Package ID is required', 400);
            }

            // TODO: Implement cost calculation logic
            res.status(200).json({ message: `Package ${id} cost metrics` });

        } catch (error) {
            console.error('[PackageController] Failed to calculate package cost:', error);
            throw new ApiError('Failed to calculate package cost', error instanceof ApiError ? error.statusCode : 500);
        }
    }

    /**
     * Processes GET /byRegEx request to search packages by regex
     * @param req Express request containing search regex
     * @param res Express response
     * @throws ApiError if search fails or regex is invalid
     */
    static async getPackagesByRegEx(req: Request, res: Response): Promise<void> {
        try {
            console.log('[PackageController] Processing GET /byRegEx request');
            const { regex } = req.query;

            if (!regex || typeof regex !== 'string') {
                throw new ApiError('Valid regex parameter is required', 400);
            }

            // TODO: Implement regex search logic
            res.status(200).json({ message: `Packages matching ${regex}` });

        } catch (error) {
            console.error('[PackageController] Failed to search packages by regex:', error);
            throw new ApiError('Failed to search packages', error instanceof ApiError ? error.statusCode : 500);
        }
    }
}