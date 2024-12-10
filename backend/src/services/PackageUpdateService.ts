/**
 * @file PackageUpdateService.ts
 * Service contains the business logic for updating packages in the database.
 */

import { ApiError } from "../utils/errors/ApiError.js";
import { AppDataSource } from "../data-source.js";
import { PackageUploadService } from "./PackageUploadService.js";
import { PackageMetadata } from "../entities/PackageMetadata.js";
import { PackageData } from "../entities/PackageData.js";

/**
 * @class PackageUpdateService
 * Service class that handles package updates in the database
 * 
 */
export class PackageUpdateService {
    /**
     * Updates an existing package with new content or URL
     * @param name - Package name
     * @param version - New package version
     * @param id - Package ID
     * @param content - Base64 encoded package content (optional)
     * @param url - Package URL (optional)
     * @param debloat - Whether to debloat the package
     * @param jsProgram - JavaScript program to include
     * @returns Updated package data
     * @throws ApiError if update fails or validation errors occur
     */
    public static async updatePackage(
        name: string, 
        version: string, 
        id: string, 
        content: string, 
        url: string, 
        debloat: boolean, 
        jsProgram: string
    ) {
        try {
            console.log(`[PackageUpdateService] Processing update for package ${name}@${version}`);

            // Input validation
            if (!name || !version || !id) {
                throw new ApiError('Name, version and ID are required', 400);
            }

            // Verify package exists
            const packageMetadataRepository = AppDataSource.getRepository(PackageMetadata);
            const existingMetadata = await packageMetadataRepository.findOne({ 
                where: { name: name, id: id },
            });

            if (!existingMetadata) {
                throw new ApiError(`Package ${name} with ID ${id} not found`, 404);
            }

            // Get existing package data
            const packageDataRepository = AppDataSource.getRepository(PackageData);
            const existingData = await packageDataRepository.findOne({
                where: { packageId: id },
                select: ['url']
            });
            
            if (!existingData) {
                throw new ApiError(`Package data not found for ID ${id}`, 404);
            }

            console.log(`[PackageUpdateService] Updating package ${name} from ${existingMetadata.version} to ${version}`);

            // Process update based on original upload type
            if (content && !existingData.url) {
                return await PackageUploadService.uploadContentType(name, version, content, jsProgram, debloat);
            } 
            
            if (url && existingData.url) {
                return await PackageUploadService.uploadUrlType(name, version, url, jsProgram);
            }

            throw new ApiError('Must update package using original upload type (Content or URL)', 400);

        } catch (error) {
            console.error('[PackageUpdateService] Update failed:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Failed to update package', 500);
        }
    }

}