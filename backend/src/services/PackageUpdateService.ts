import { ApiError } from "../utils/errors/ApiError.js";
import { AppDataSource } from "../data-source.js";
import { PackageMetadata } from "../entities/PackageMetadata.js";
import { 
    getPackageJsonFromContentBuffer, 
    extractNameAndVersionFromPackageJson, 
    extractGithubAttributesFromGithubUrl, 
    normalizeToGithubUrl, 
    extractGithubUrlFromPackageJson 
} from '../utils/packageHelpers.js';


/**
 * @class PackageUpdateService
 * Provides functionality to update package metadata and content.
 */
export class PackageUpdateService {
    
    public static async updatePackage( name: string, version: string, id: string, content: string, url: string, debloat: string, jsProgram: string) {
        
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

    } 
        
    private static async validateUpdateContentTypeNameAndVersion(name: string, version: string, content: string) {

    }

    private static async validateUpdateUrlTypeNameAndVersion(name: string, version: string, url: string) {

    }

    
};