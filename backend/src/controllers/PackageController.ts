import chalk from 'chalk';

/**
 * @file PackageController.ts
 * Controller handles HTTP requests for package management endpoints.
 * Processes requests, delegates to services, and returns responses.
 */
import 'reflect-metadata';
import { Request, Response, NextFunction } from 'express';
import { PackageUploadService } from '../services/PackageUploadService.js';
import { PackageGetterService } from '../services/PackageGetterService.js';
import { PackageUpdateService } from '../services/PackageUpdateService.js';
import { PackageCostService } from '../services/PackageCostService.js';
import { truncateResponse } from '../utils/truncateResponse.js';
import { PackageQuery } from '../utils/types/PackageQuery.js';
import { PackageRegExDto } from '../utils/types/PackageRegExDto.js';
import { AppDataSource } from '../data-source.js';
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
        console.log(chalk.blue('[PackageController] Processing POST /packages request'));
        try {

            // Destructure offset and queries from request
            const offset = req.query.offset as string;
            const queries: PackageQuery[] = req.body;

            try {
                console.log(chalk.magenta(`------>[REQUEST]-------> POST /packages\nBody: ${JSON.stringify(req.body, null, 2)}\nQuery: ${JSON.stringify(req.query, null, 2)}\n-------------------------------------------------`));
            } catch (error) {
                console.error(chalk.red('Error outputting request: '), error);
            }

            if (!queries || !Array.isArray(queries)) {
                throw new ApiError('Invalid query format: Expected array of package queries', 400);
            }

            // Call queryPackages service method
            const { packages, nextOffset } = await PackageGetterService.queryPackages(queries, offset);
            
            // Set offset header if next offset is available
            if (nextOffset) {
                console.log(chalk.yellow(`[PackageController] Setting offset header to ${nextOffset}`));
                res.setHeader('offset', nextOffset);
            }
            
            // Return response with package query results
            res.status(200).json(packages);
            console.log(chalk.green(`------>[RESPONSE]-------> 200 OK\nBody: ${JSON.stringify(packages, null, 2)}\n-------------------------------------------------`));
            return;

        } catch (error) {
            console.error(chalk.red('[PackageController] Failed to process package queries:'), error);
            next(error);
        }
    }
    
    /**
     * Processes DELETE /reset request to reset the registry
     * @param req Express request
     * @param res Express response
     * @param next Next middleware function
     * @throws ApiError if registry reset fails
     */
    static async resetRegistry(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.log(chalk.blue('[PackageController] Processing DELETE /reset request'));
        try {
            
            try {
                console.log(chalk.magenta(`------>[REQUEST]-------> DELETE /reset\nBody: ${JSON.stringify(req.body, null, 2)}\nQuery: ${JSON.stringify(req.query, null, 2)}\n-------------------------------------------------`));
            } catch (error) {
                console.error(chalk.red('Error outputting request: '), error);
            }

            // Use TRUNCATE CASCADE to clear all related tables
            await AppDataSource.query('TRUNCATE TABLE package_metadata CASCADE');
            
            console.log(chalk.blue('[PackageController] Registry reset complete'));
            
            // Return response with success message
            const response = { message: 'Registry reset successful' };
            res.status(200).json(response);
            console.log(chalk.green(`------>[RESPONSE]-------> 200 OK\nBody: ${JSON.stringify(response, null, 2)}\n-------------------------------------------------`));

        } catch (error) {
            console.error(chalk.red('[PackageController] Failed to reset registry:'), error);
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
        console.log(chalk.blue(`[PackageController] Processing GET /:id request`));
        try {

            // Destructure package ID from request parameters
            const { id } = req.params;

            try {
                console.log(chalk.magenta(`------>[REQUEST]-------> GET /${id}\nParams: ${JSON.stringify(req.params, null, 2)}\nQuery: ${JSON.stringify(req.query, null, 2)}\n-------------------------------------------------`));
            } catch (error) {
                console.error(chalk.red('Error outputting request: '), error);
            }

            if (!id) {
                throw new ApiError('Package ID is required', 400);
            }

            const result = await PackageGetterService.getPackageMetadataAndDataById(id);

            if (!result) {
                throw new ApiError('Package not found', 404);
            }

            // Return response with package metadata and data
            res.status(200).json(result);
            console.log(chalk.green(`------>[RESPONSE]-------> 200 OK\nBody: ${truncateResponse(result)}\n-------------------------------------------------`));
            
            return;

        } catch (error) {
            console.error(chalk.red('[PackageController] Failed to fetch package:'), error);
            next(error);
        }
    }

    /**
     * Processes POST /:id request to update a package
     * @param req Express request containing package ID and update data
     * @param res Express response
     * @param next Next middleware function
     * @throws ApiError if update fails
     */
    static async updatePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.log(chalk.blue(`[PackageController] Processing POST /package/:id request`));
        try {

            // Destructure package ID from request parameters
            const { id } = req.params;

            try {
                console.log(chalk.magenta(`------>[REQUEST]-------> POST /package/${id}\nParams: ${JSON.stringify(req.params, null, 2)}\nBody: ${JSON.stringify(req.body, null, 2)}\nQuery: ${JSON.stringify(req.query, null, 2)}\n-------------------------------------------------`));
            } catch (error) {
                console.error(chalk.red('Error outputting request: '), error);
            }

            // Destructure metadata and data objects from request body
            const { metadata, data } = req.body;

            // Destructure metadata and data objects
            const { Name: metaName, Version: version, ID: pkgId } = metadata;
            const { Name: dataName, Content: content, URL: url, debloat, JSProgram: jsProgram } = data;

            // Validate request data
            if (!id || id !== pkgId) {
                throw new ApiError('Package ID is required and must match metadata ID', 400);
            }
            if (metaName !== dataName) {
                throw new ApiError('Metadata and data names must match', 400);
            }
            if ((!content && !url) || (content && url)) {
                throw new ApiError('Provide either Content or URL, not both', 400);
            }

            // Call updatePackage service method
            const results = await PackageUpdateService.updatePackage(dataName, version, pkgId, content, url, debloat, jsProgram);
        
            if (!results) {
                throw new ApiError('Failed to update package', 500);
            }

            // Return response with update result
            const response = { message: 'Version is updated.' };
            res.status(200).json(response);
            console.log(chalk.green(`------>[RESPONSE]-------> 200 OK\nBody: ${JSON.stringify(response, null, 2)}\n-------------------------------------------------`));
            return;

        } catch (error) {
            console.error(chalk.red('[PackageController] Failed to update package:'), error);
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
        console.log(chalk.blue('[PackageController] Processing POST /package request'));
        try {
            
            try {
                console.log(chalk.magenta(`------>[REQUEST]-------> POST /package\nBody: ${JSON.stringify(req.body, null, 2)}\nQuery: ${JSON.stringify(req.query, null, 2)}\n-------------------------------------------------`));
            } catch (error) {
                console.error(chalk.red('Error outputting request: '), error);
            }

            // Destructure package data from request body
            const { Name, Version, Content, URL, JSProgram, debloat } = req.body;

            // Process package upload containing content
            if (Content && !URL) {
                console.log(chalk.blue('[PackageController] Processing Content upload'));
                
                // Call uploadContentType service method
                const result = await PackageUploadService.uploadContentType(Name, Version, Content, JSProgram, debloat);

                if (!result) {
                    throw new ApiError('Failed to upload package', 500);
                }

                // Return response with package upload result
                res.status(201).json(result);
                console.log(chalk.green(`------>[RESPONSE]-------> 200 OK\nBody: ${truncateResponse(result)}\n-------------------------------------------------`));
                return;
            }

            // Process package upload containing URL
            if (URL && !Content) {
                console.log(chalk.blue('[PackageController] Processing URL upload'));
                
                // Call uploadUrlType service method
                const result = await PackageUploadService.uploadUrlType(Name, Version, URL, JSProgram);
                
                if (!result) {
                    throw new ApiError('Failed to upload package', 500);
                }

                // Return response with package upload result
                res.status(201).json(result);
                console.log(chalk.green(`------>[RESPONSE]-------> 200 OK\nBody: ${truncateResponse(result)}\n-------------------------------------------------`));
                return;
            }

            throw new ApiError('Invalid package data: Provide either Content or URL, not both', 400);

        } catch (error) {
            console.error(chalk.red('[PackageController] Package upload failed:'), error);
            next(error);
        }
    }

    /**
     * Processes GET /:id/rate request to get package rating
     * @param req Express request containing package ID
     * @param res Express response
     * @param next Next middleware function
     * @throws ApiError if rating cannot be retrieved
     */
    static async getPackageRating(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.log(chalk.blue(`[PackageController] Processing GET /:id/rate request`));
        try {

            // Destructure package ID from request parameters
            const { id } = req.params;

            try {
                console.log(chalk.magenta(`------>[REQUEST]-------> GET /${id}/rate\nParams: ${JSON.stringify(req.params, null, 2)}\nQuery: ${JSON.stringify(req.query, null, 2)}\n-------------------------------------------------`));
            } catch (error) {
                console.error(chalk.red('Error outputting request: '), error);
            }

            if (!id) {
                throw new ApiError('Package ID is required', 400);
            }

            // Call getPackageRatingFromId service method
            const result = await PackageGetterService.getPackageRatingFromId(id);
    
            if (!result) {
                throw new ApiError('Failed to fetch package rating', 500);
            }

            // Return response with package rating
            res.status(200).json(result);
            console.log(chalk.green(`------>[RESPONSE]-------> 200 OK\nBody: ${JSON.stringify(result, null, 2)}\n-------------------------------------------------`));
            return;

        } catch (error) {
            console.error(chalk.red('[PackageController] Failed to fetch package rating:'), error);
            next(error);
        }
    }

    /**
     * Processes GET /:id/cost request to get package cost metrics
     * @param req Express request containing package ID
     * @param res Express response
     * @throws ApiError if cost metrics cannot be retrieved
     */
    static async getPackageCost(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.log(chalk.blue(`[PackageController] Processing GET /:id/cost request`));
        try {

            // Destructure package ID from request parameters and optional dependencies query parameter
            const { id } = req.params;
            const includeDependencies = req.query.dependency === 'true';

            try {
                console.log(chalk.magenta(`------>[REQUEST]-------> GET /${id}/cost\nParams: ${JSON.stringify(req.params, null, 2)}\nQuery: ${JSON.stringify(req.query, null, 2)}\n-------------------------------------------------`));
            } catch (error) {
                console.error(chalk.red('Error outputting request: '), error);
            }

            // Validate package ID
            if (!id) {
                throw new ApiError('Package ID is required', 400);
            }

            // Call calculatePackageCost service method
            const result = await PackageCostService.calculatePackageCost(id, includeDependencies);
            
            if (!result) {
                throw new ApiError('Failed to calculate package cost', 500);
            }
            
            // Return response with package cost metrics
            res.status(200).json(result);
            console.log(chalk.green(`------>[RESPONSE]-------> 200 OK\nBody: ${JSON.stringify(result, null, 2)}\n-------------------------------------------------`));
            return;

        } catch (error) {
            console.error(chalk.red('[PackageController] Failed to calculate package cost:'), error);
            next(error);
        }
    }

    /**
     * Processes POST /byRegEx request to search packages by regex
     * @param req Express request containing search regex
     * @param res Express response
     * @param next Next middleware function
     * @throws ApiError if search fails or regex is invalid
     */
    static async getPackagesByRegEx(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.log(chalk.blue('[PackageController] Processing POST /byRegEx request'));
        try {
            
            try {
                console.log(chalk.magenta(`------>[REQUEST]-------> POST /byRegEx\nBody: ${JSON.stringify(req.body, null, 2)}\nQuery: ${JSON.stringify(req.query, null, 2)}\n-------------------------------------------------`));
            } catch (error) {
                console.error(chalk.red('Error outputting request: '), error);
            }

            // Destructure regex from request body as data transfer object
            const regex = req.body as PackageRegExDto;
            if (!regex) {
                throw new ApiError('Invalid regex format: Provide a valid regex string', 400);
            }

            // Call searchByRegex service method
            const result = await PackageGetterService.searchByRegex(regex);

            if (!result) {
                throw new ApiError('Failed to search packages by regex', 500);
            }

            // Return response with search results
            res.status(200).json(result);
            console.log(chalk.green(`------>[RESPONSE]-------> 200 OK\nBody: ${JSON.stringify(result, null, 2)}\n-------------------------------------------------`));
            return;

        } catch (error) {
            console.error(chalk.red('[PackageController] Failed to search packages by regex:'), error);
            next(error);
        }
    }
};