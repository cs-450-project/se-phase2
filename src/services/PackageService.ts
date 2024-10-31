/** 
 * @file src/services/PackageService.ts
 * Service contains the business logic for the API.
 */

import { AppDataSource } from "../data-source.js";
import { PackageMetadata } from "../entities/PackageMetadata.js";
import { PackageData } from "../entities/PackageData.js";

export class PackageService {

    static async uploadContentType(Content: string, JSProgram: string, debloat: boolean) {
        
        console.log('[PackageService] Processing Content type package...');

        // Get PackageMetadata repository
        const packageMetadataRepository = await AppDataSource.getRepository(PackageMetadata);
        const metadata = packageMetadataRepository.create({
            name: 'awesome-package1',
            version: '6.9.0',
        })
        
        await packageMetadataRepository.save(metadata);

        // Get PackageData repository
        const packageDataRepository = await AppDataSource.getRepository(PackageData);
        const data = packageDataRepository.create({
            packageMetadata: metadata,
            content: Content,
            debloat: debloat,
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
            }
        };

    }

}