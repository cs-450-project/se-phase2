/** 
 * @file src/services/PackageUploadService.ts
 * Service contains the business logic for uploading a package to the database.
 */



import axios from 'axios';

import { ApiError } from "../utils/errors/ApiError.js";
import { AppDataSource } from "../data-source.js";
import { PackageMetadata } from "../entities/PackageMetadata.js";
import { PackageData } from "../entities/PackageData.js";
import { evaluateMetrics } from './evaluators/evaluateMetrics.js';
import { Ranker } from './scores/Ranker.js';
import { getPackageJsonFromContentBuffer, extractNameAndVersionFromPackageJson, extractGitHubAttributesFromGitHubURL, getNpmRepoURLFromGitHubURL, normalizeToGithubUrl, extractGitHubLinkFromPackageJson } from '../utils/packageDataHelpers.js';

import octokit from '../utils/octokit.js';

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

        // Extract the package.json from the zip file
        const packageJson = getPackageJsonFromContentBuffer(Content);

        // Extract the package name and version from the zip file
        const { Name, Version } = extractNameAndVersionFromPackageJson(packageJson);

        const link = await extractGitHubLinkFromPackageJson(packageJson);

        const { owner, repo } = extractGitHubAttributesFromGitHubURL(await extractGitHubLinkFromPackageJson(packageJson));

        const scorecard = await evaluateMetrics(owner, repo);

        console.log(`Ranker: ${JSON.stringify(scorecard)}`);

        // Get PackageMetadata repository, create metadata and save
        const packageMetadataRepository = AppDataSource.getRepository(PackageMetadata);

        // Check if the package already exists
        const existingMetadata = await packageMetadataRepository.findOne({ 
            where: { name: Name, version: Version },
        });

        if (existingMetadata) {
            console.log(`[PackageUploadService] Package with name ${Name} and version ${Version} already exists.`);
            throw new ApiError('Package exists already.', 409);
        }

        const metadata = packageMetadataRepository.create({
            name: Name,
            version: Version,
        });
        await packageMetadataRepository.save(metadata);

        console.log(`[PackageUploadService] Package with name ${Name} and version ${Version} saved to the database.`);

        // Get PackageData repository, create data and save
        const packageDataRepository = AppDataSource.getRepository(PackageData);
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
            
            const Content = await this.getContentBufferFromGithubUrl(URL);

            const packageJson = getPackageJsonFromContentBuffer(Content);

            const { Name, Version } = extractNameAndVersionFromPackageJson(packageJson);
        
            const { owner, repo } = extractGitHubAttributesFromGitHubURL(await normalizeToGithubUrl(URL));

            const scorecard = await evaluateMetrics(owner, repo);

            console.log(`Ranker: ${JSON.stringify(scorecard)}`);

            const packageMetadataRepository = await AppDataSource.getRepository(PackageMetadata);
            const metadata = packageMetadataRepository.create({
                name: Name,
                version: Version,
            });
            await packageMetadataRepository.save(metadata);
    
            const packageDataRepository = await AppDataSource.getRepository(PackageData);
            const data = packageDataRepository.create({
                packageMetadata: metadata,
                content: Content,
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
     * @function getContentBufferFromGithubUrl
     * Converts npm link to GitHub link if applicable.
     * Supports URLs like npm and GitHub URLs.
     * 
     * @param URL string - The input URL to normalize
     * @returns Normalized GitHub URL or the original URL if no conversion is needed.
     */
    private static async getContentBufferFromGithubUrl(URL: string): Promise<string> {

        const githubUrl = await normalizeToGithubUrl(URL);
        
        const { owner, repo } = extractGitHubAttributesFromGitHubURL(githubUrl);

        const defaultBranch = await this.getDefaultBranch(owner, repo);

        const normalizedURL = `https://github.com/${owner}/${repo}/archive/${defaultBranch}.zip`;

        const response = await axios.get(normalizedURL, { responseType: 'arraybuffer' });
        const zipBuffer = Buffer.from(response.data, 'binary');
        const base64Zip = zipBuffer.toString('base64');

        return base64Zip;

    } // end normalizePackageURL


    // Get the default branch of a GitHub repository (e.g. main, master)
    private static async getDefaultBranch(owner: string, repo: string): Promise<string> {
        try {
            const response = await octokit.repos.get({
                owner,
                repo
            });
            return response.data.default_branch;
        } catch (error) {
            console.error('Failed to get default branch:', error);
            throw new ApiError('Failed to get default branch.', 400);
        }
    } // end getDefaultBranch

};

