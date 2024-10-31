/** 
 * @file src/controllers/PackageController.ts
 * Controller processes requests, delegates logic to services, and returns the response.
 */

import { Request, Response } from 'express';
import { PackageMetadata } from '../entities/PackageMetadata.js';
import { PackageData } from '../entities/PackageData.js';
import AdmZip from 'adm-zip';

export class PackageController {

    static async uploadPackage(req: Request, res: Response) {
        try {
            const data = req.body;
            console.log('[PackageController] Uploading package...');
        } catch {
            console.error('[PackageController] Error uploading package.');
        }
    }

}