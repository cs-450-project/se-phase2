/**
 * @file PackageController.ts
 */

import { Request, Response, NextFunction } from 'express';
import { PackageUploadService } from '../services/PackageUploadService.js';
import { PackageGetterService } from '../services/PackageGetterService.js';
import { PackageQuery } from '../utils/types/PackageQuery.js';
import { ApiError } from '../utils/errors/ApiError.js';
import { PackageMetadata } from '../entities/PackageMetadata.js';

/**
 * @class PackageController
 * Controller class that processes /package requests, invokes the appropriate service, and returns the response.
 * 
 */
export class PackageController {

    // POST /packages handler
    static async getPackages(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('POST /packages');
            // Pull the array of package queries from the request body
            const queries: PackageQuery[] = req.body;
            
            if (!queries) {
                throw new ApiError('No queries provided.', 400);
            }

            // Call the service to query the packages
            const results = await PackageGetterService.queryPackages(queries);

            // Send the response back to the client
            res.json(results);
            return;

        } catch (error) {
            next(error);
        }
    }
    
    // DELETE /reset handler
    static async resetRegistry(req: Request, res: Response) {
        console.log('DELETE /reset');
        res.status(200).json({ message: 'DELETE /reset' });
    }

    // GET /:id handler
    static async getPackage(req: Request, res: Response) {
        try {
            console.log('GET /:id');
            const id = req.params.id;
            console.log('[PackageController] Requested package ID:', id);
            if (!id) {
                res.status(400).json({ message: 'Bad Request' });
                return;
            }
            res.status(200).json({ message: 'GET /:id' });
        } catch (error) {
            console.error('[PackageController] An error occurred with the GET package/:id request:', error);
            res.status(400).json({ message: 'Bad Request' });
            return;
        }

    }

    // PUT /:id handler
    static async updatePackage(req: Request, res: Response) {
        console.log('PUT /:id');
        res.status(200).json({ message: 'PUT /:id' });
    }

    // POST /package handler
    static async uploadPackage(req: Request, res: Response, next: NextFunction) {
        console.log('POST /package');
        try {
            // Pull the Content, URL, debloat, and JSProgram from the request body
            const { Content, URL, JSProgram, debloat } = req.body;

            // Request contains Content
            if (Content && !URL) {
                console.log('[PackageController] Request contains Content.');

                // Call the service to process the Content package
                const result = await PackageUploadService.uploadContentType(Content, JSProgram, debloat);

                // Send the response back to the client
                res.status(200).json({ 
                    ...(result ? { ...JSON.parse(JSON.stringify(result)) } : {})
                 });
                return;
            }
            // Request contains URL
            else if (URL && !Content) {
                console.log('[PackageController] Request contains URL.');
                
                // Call the service to process the URL package
                const result = await PackageUploadService.uploadURLType(URL, JSProgram);

                // Send the response back to the client
                res.status(200).json({ 
                    ...(result ? { ...JSON.parse(JSON.stringify(result)) } : {})
                 });
                return;
            }
            // Request contains both Content and URL, or neither
            else {
                console.log('[PackageController] Request does not contain Content or URL.');
                throw new ApiError('Package data is formatted improperly.', 400);
            }
        } catch (error) {
            next(error);
        }
    }

    // GET /:id/rate handler
    static async getPackageRating(req: Request, res: Response) {
        console.log('GET /:id/rate');
        res.status(200).json({ message: 'GET /:id/rate' });
    }

    // GET /:id/cost handler
    static async getPackageCost(req: Request, res: Response) {
        console.log('GET /:id/cost');
        res.status(200).json({ message: 'GET /:id/cost' });
    }

    // GET /byRegEx handler
    static async getPackagesByRegEx(req: Request, res: Response) {
        console.log('GET /byRegEx');
        res.status(200).json({ message: 'GET /byRegEx' });
    }

}
