import { ApiError } from "../utils/errors/ApiError.js";
import { AppDataSource } from "../data-source.js";
import { PackageUploadService } from "./PackageUploadService.js";
import { PackageMetadata } from "../entities/PackageMetadata.js";
import { PackageData } from "../entities/PackageData.js";
import { 
    getPackageJsonFromContentBuffer, 
    extractNameAndVersionFromPackageJson, 
    extractGithubAttributesFromGithubUrl, 
    normalizeToGithubUrl, 
    extractGithubUrlFromPackageJson, 
    getContentZipBufferFromGithubUrl
} from '../utils/packageHelpers.js';


/**
 * @class PackageUpdateService
 * Provides functionality to update package metadata and content.
 */
export class PackageUpdateService {
    
    public static async updatePackage( name: string, version: string, id: string, content: string, url: string, debloat: boolean, jsProgram: string) {
        try {
            // Check that name and ID matches valid package in the database
            const packageMetadataRepository = AppDataSource.getRepository(PackageMetadata);
            const existingMetadata = await packageMetadataRepository.findOne({ 
                where: { name: name, id: parseFloat(id) },
            });
            if (!existingMetadata) {
                throw new ApiError('Package not found', 404);
            }

            // Check that the version does not already exist
            if (existingMetadata.version === version) {
                throw new ApiError(`Package ${name} version ${version} already exists`, 400);
            }

            const packageDataRepository = AppDataSource.getRepository(PackageData);
            const existingData = await packageDataRepository.findOne({ 
                where: { packageId: parseFloat(id) },
            });

            // Process package update
            if (existingData && content && !existingData.url) {
                if(await this.validateUpdateContentTypeNameAndVersion(name, version, content)){
                    return await PackageUploadService.uploadContentType(content, jsProgram, debloat);
                }
            } else if (existingData && url && existingData.url) {
                if(await this.validateUpdateUrlTypeNameAndVersion(name, version, url)){
                    return await PackageUploadService.uploadUrlType(url, jsProgram);
                }
            } else {
                throw new ApiError('Cannot update package with different content type', 400);
            }
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError('Failed to update package', 500);
        }

    } 
        
    private static async validateUpdateContentTypeNameAndVersion(name: string, version: string, content: string) {
        const packageJson = getPackageJsonFromContentBuffer(content);
        const { name: newName, version: newVersion } = extractNameAndVersionFromPackageJson(packageJson);
        if (newName !== name || newVersion !== version) {
            throw new ApiError('Package name and version in content type request do not match the given name and version', 400);
        }
        return true;
    }

    private static async validateUpdateUrlTypeNameAndVersion(name: string, version: string, url: string) {
        const githubUrl = await normalizeToGithubUrl(url);
        const contentZipBuffer = await getContentZipBufferFromGithubUrl(githubUrl);
        const packageJson = getPackageJsonFromContentBuffer(contentZipBuffer);
        const { name: newName, version: newVersion } = extractNameAndVersionFromPackageJson(packageJson);
        if (newName !== name || newVersion !== version) {
            throw new ApiError('Package name and version in URL type request do not match the given name and version', 400);
        }
        return true;
    }

};