/** 
 * @file src/services/PackageService.ts
 * Service contains the business logic for the API.
 */


import AdmZip from 'adm-zip';

import { AppDataSource } from "../data-source.js";
import { PackageMetadata } from "../entities/PackageMetadata.js";
import { PackageData } from "../entities/PackageData.js";

export class PackageService {

    static async uploadContentType(Content: string, JSProgram: string, debloat: boolean) {
        try {
            console.log('[PackageService] Uploading Content type package to the database...');

            // Extract the package name and version from the zip file
            const extracted = await extractNameAndVersionFromZip(Content);
            if (!extracted) {
                throw new Error('Failed to extract name and version from zip content');
            }
            const { Name, Version } = extracted;

            // Get PackageMetadata repository, create metadata and save
            const packageMetadataRepository = await AppDataSource.getRepository(PackageMetadata);
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

        } catch (error) {
            console.error('[PackageService] An error occurred while adding the Content package to the database.', error);
            throw error;
        }
    }
};


/**
 * @function extractNameAndVersionFromZip
 * Extracts the name and version of the package from the package.json file in the zip content.
 * 
 * @param Content Base64 encoded zip file
 * @returns Object containing the name and version of the package
 */
async function extractNameAndVersionFromZip(Content: string) {
    // Decode the base64 encoded zip file to binary buffer
    const zipBuffer = Buffer.from(Content, 'base64');

    // Load buffer as zip file and extract package.json
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    const targetEntry = zipEntries.find(entry => entry.entryName.endsWith('package.json'));
    
    // Process package.json file
    if (targetEntry){
        console.log('Found file: ', targetEntry.entryName);
        
        // Parse package.json file
        const fileData = targetEntry.getData();
        const packageJson = JSON.parse(fileData.toString('utf8'));
        
        // Extract name and version if available
        const Name = packageJson.name || 'Unknown';
        const Version = packageJson.version || '0.0.0';

        return { Name, Version };

    } else {
        console.log('package.json not found in zip file.');
        return { Name: 'Unknown', Version: '0.0.0' };
    }
}
