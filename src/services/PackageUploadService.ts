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
            const normalizedURL = await this.normalizePackageURL(URL);
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

    /**
     * @function normalizePackageURL
     * Converts npm link to GitHub link if applicable.
     * Supports URLs like npm and GitHub URLs.
     * 
     * @param URL string - The input URL to normalize
     * @returns Normalized GitHub URL or the original URL if no conversion is needed.
     */
    private static async normalizePackageURL(URL: string): Promise<string | null> {

        // Check if the URL is an npm package URL
        if (URL.includes('npmjs.com/package/')) {
            // Convert npm URL to GitHub URL
            const npmGithubURL = await this.getNpmRepoURL(URL);
            // Extract owner and repo from GitHub URL
            const { owner, repo } = this.getGitHubAttributes(npmGithubURL);
            // Get default branch
            const defaultBranch = await this.getDefaultBranch(owner, repo);
            // Construct GitHub zip URL
            return `https://github.com/${owner}/${repo}/archive/${defaultBranch}.zip`; 
        }

        // Check if the URL is a GitHub URL
        else if (URL.includes('github.com')) {
            // Extract owner and repo from GitHub URL
            const { owner, repo } = this.getGitHubAttributes(URL);
            // Get default branch
            const defaultBranch = await this.getDefaultBranch(owner, repo);
            // Construct GitHub zip URL
            return `https://github.com/${owner}/${repo}/archive/${defaultBranch}.zip`; 
        }

        // Unsupported URL format
        else {
            throw new ApiError('Unsupported URL format.', 400);
        }
    }

    private static async getNpmRepoURL(url: string): Promise<string> {
        const npmApiUrl = url.replace(/(?<=\/)www(?=\.)/, 'replicate').replace('/package', '');
        console.log(`Fetching repository URL from npm API: ${npmApiUrl}`);
        const npmApiResponse = await fetch(npmApiUrl);
        const npmApiData = await npmApiResponse.json();

        if (!npmApiData.repository || !npmApiData.repository.url) {
            console.log(`Repository URL not found in npm package data for URL: ${url}`);
            throw new ApiError('Repository URL not found in npm package data', 400);
        }

        const npmRepoUrl = npmApiData.repository.url;
        console.log(`NPM Repository URL: ${npmRepoUrl}`);
        return npmRepoUrl;
    }

    private static getGitHubAttributes(urlRepo: string): { owner: string, repo: string } {
        
        var owner = urlRepo.split('/')[3].trim();
        var repo = urlRepo.split('/')[4].trim();

        if (repo.includes('.git')) {
            repo = repo.replace('.git', '');
        }

        console.log(`Owner: ${owner}`);
        console.log(`Repo: ${repo}`);

        return { owner, repo };
    }

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
    }

     

};

