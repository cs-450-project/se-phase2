/**
 * @file PackageController.ts
 */

import { Request, Response } from 'express';
import { PackageUploadService } from '../services/PackageUploadService.js';

/**
 * @class PackageController
 * Controller class that processes /package requests, invokes the appropriate service, and returns the response.
 * 
 */
export class PackageController {

    // POST /package handler
    static async uploadPackage(req: Request, res: Response) {
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

                // Send the response back to the client
                res.status(200).json({ 
                    message: 'URL package uploaded successfully.',
                    processedData: { URL, JSProgram },
                 });
                return;
            }
            // Request contains both Content and URL, or neither
            else {
                console.log('[PackageController] Request does not contain Content or URL.');
                res.status(400).json({ message: 'There is missing field(s) in the PackageData or it is formed improperly (e.g. Content and URL ar both set)' });
                return;
            }
        } catch (error) {
            console.error('[PackageController] An error occurred while processing the request:', error);
            res.status(400).json({ message: 'Bad Request' });
            return;
        }
    }
}
