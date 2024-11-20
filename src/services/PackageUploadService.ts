/** 
 * @file src/services/PackageUploadService.ts
 * Service contains the business logic for uploading a package to the database.
 */


import AdmZip from 'adm-zip';
import axios from 'axios';

import { ApiError } from "../utils/errors/ApiError.js";
import { AppDataSource } from "../data-source.js";
import { PackageMetadata } from "../entities/PackageMetadata.js";
import { PackageData } from "../entities/PackageData.js";

/**
 * @class PackageUploadService
 * Service class that contains the business logic for uploading a package to the database.
 * 
 */
export class PackageUploadService {

    /**
     * @function uploadContentType
     * Uploads a package that contains Base64 encoded zip file to the database. 
     * 
     * @param Content Base64 encoded zip file
     * @param JSProgram Base64 encoded JavaScript program
     * @param debloat Boolean indicating whether to debloat the package
     * @returns Object containing Json data of the uploaded package
     */
    static async uploadContentType(Content: string, JSProgram: string, debloat: boolean) {
        console.log('[PackageService] Uploading Content type package to the database.');

        // Extract the package name and version from the zip file
        const extracted = await this.extractNameAndVersionFromZip(Content);
        if (!extracted) {
            throw new ApiError('Failed to extract name and version from zip content', 400);
        }
        const { Name, Version } = extracted;

        // Get PackageMetadata repository, create metadata and save
        const packageMetadataRepository = await AppDataSource.getRepository(PackageMetadata);

        // Check if the package already exists
        const existingMetadata = await packageMetadataRepository.findOne({ 
            where: { name: Name, version: Version },
        });

        if (existingMetadata) {
            throw new ApiError('Package exists already.', 409);
        }

        const metadata = packageMetadataRepository.create({
            name: Name,
            version: Version,
        });
        await packageMetadataRepository.save(metadata);

        // Get PackageData repository, create data and save
        const packageDataRepository = await AppDataSource.getRepository(PackageData);
        const data = packageDataRepository.create({
            // 1:1 relationship between metadata and data
            packageMetadata: metadata,
            content: Content,
            debloat: debloat,
            jsProgram: JSProgram,
        });
        await packageDataRepository.save(data);

        // Return the contents of the uploaded package
        return {
            metadata: {
                Name: metadata.name,
                Version: metadata.version,
                ID: metadata.id,
            },
            data: {
                Content: data.content,
                JSProgram: data.jsProgram,
            }
        };

    };

    /**
     * @function uploadURLType
     * Uploads a package that contains a URL to the database.
     * 
     * @param URL URL of the package
     * @param JSProgram Base64 encoded JavaScript program
     */
    static async uploadURLType(URL: string, JSProgram: string) {
        try {
            console.log('[PackageUploadService] Uploading URL type package to the database.');
            const normalizedURL = await normalizePackageURL(URL);
            if (!normalizedURL) {
                throw new Error('Invalid or unsupported URL');
            }

            console.log('Normalized URL:', normalizedURL);

            const response = await axios.get(normalizedURL, { responseType: 'arraybuffer' });
            const zipBuffer = Buffer.from(response.data, 'binary');
            const base64Zip = zipBuffer.toString('base64');
            const extracted = await this.extractNameAndVersionFromZip(base64Zip);
            if (!extracted) {
                throw new Error('Failed to extract name and version from zip content');
            }
            const { Name, Version } = extracted;
            const packageMetadataRepository = await AppDataSource.getRepository(PackageMetadata);
            const metadata = packageMetadataRepository.create({
                name: Name,
                version: Version,
            });
            await packageMetadataRepository.save(metadata);
    
            const packageDataRepository = await AppDataSource.getRepository(PackageData);
            const data = packageDataRepository.create({
                packageMetadata: metadata,
                content: base64Zip,
                debloat: false,
                jsProgram: JSProgram,
            });
            await packageDataRepository.save(data);
    
            return {
                metadata: {
                    Name: metadata.name,
                    Version: metadata.version,
                    ID: metadata.id,
                },
                data: {
                    Content: data.content,
                    JSProgram: data.jsProgram,
                },
            };
    
        } catch (error) {
            //console.error('[PackageUploadService] An error occurred while adding the URL package to the database.', error);
            throw error;
        }
    }

    /**
 * @function extractNameAndVersionFromZip
 * Extracts the name and version of the package from the package.json file in the zip content.
 * 
 * @param Content Base64 encoded zip file
 * @returns Object containing the name and version of the package
 */
    static async extractNameAndVersionFromZip(Content: string) {

        try {

            // Decode the base64 encoded zip file to binary buffer
            const zipBuffer = Buffer.from(Content, 'base64');

            // Load buffer as zip file and extract package.json
            const zip = new AdmZip(zipBuffer);
            const zipEntries = zip.getEntries();
            const targetEntry = zipEntries.find(entry => entry.entryName.endsWith('package.json'));
            
            if (!targetEntry) {
                throw new ApiError('Package.json not found.', 400);
            }

            // Parse package.json file
            const fileData = targetEntry.getData();
            const packageJson = JSON.parse(fileData.toString('utf8'));
            
            // Extract name and version if available
            const Name = packageJson.name;
            const Version = packageJson.version;

            if (!Name || !Version) {
                throw new ApiError('Name or version not found in package.json.', 400);
            }

            return { Name, Version };

        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            } 
            console.error('[PackageUploadService] An error occurred while extracting the name and version from the zip content.', error);
            throw new ApiError("Failed to extract name and version from zip content.", 400);
        }
    };


};

 /**
 * @function normalizePackageURL
 * Converts npm link to GitHub link if applicable.
 * Supports URLs like npm and GitHub URLs.
 * 
 * @param URL string - The input URL to normalize
 * @returns Normalized GitHub URL or the original URL if no conversion is needed.
 */

/*
    We unfortunately don't know whether the default branch is master or main, so we can't just append /archive/master.zip
    in the long term. We could use the GitHub API or octokit (see metric implementations) to get the default branch which 
    can then be used to construct the URL. 
*/

async function normalizePackageURL(URL: string): Promise<string | null> {
    try {
        if (URL.includes('npmjs.com/package/')) {
          const packageName = URL.split('/').pop();
          /*
          // The repo path goes 'owner'/'repo' so we can't just use the package name twice
          // I updated the last portion of the URLs to correctly point to the zip file
          // Look at Will's code from phase 1 to convert npm link to GitHub link, then add the extension
          */
          return `https://github.com/${packageName}/${packageName}/archive/master.zip`; 
        }
        if (URL.includes('github.com')) {
          const repoPath = URL.split('github.com/')[1];
          return `https://github.com/${repoPath}/archive/master.zip`;
        }
        console.error('Unsupported URL format:', URL);
        return null;
      } catch (error) {
        console.error('Error normalizing URL:', error);
        return null;
      }
}


