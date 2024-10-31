import { Request, Response } from 'express';
import { PackageMetadata } from '../entities/PackageMetadata.js';
import { PackageData } from '../entities/PackageData.js';
import AdmZip from 'adm-zip';

export class PackageController {

    static async uploadPackage(req: Request, res: Response) {
        try {
            console.log('[PackageController] Uploading package...');
        } catch {
            console.error('[PackageController] Error uploading package.');
        }
    }

}