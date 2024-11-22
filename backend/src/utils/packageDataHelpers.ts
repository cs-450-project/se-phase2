/**
 * @file packageDataHelpers.ts
 * Utility functions for package data extraction and URL manipulation
 */

import AdmZip from "adm-zip";
import { ApiError } from "./errors/ApiError.js";

/**
 * Extracts and returns package.json content from a base64 encoded zip buffer
 * @param contentBuffer - Base64 encoded zip file content
 * @returns Package.json content as string
 * @throws ApiError if package.json cannot be found or extracted
 */
export function getPackageJsonFromContentBuffer(contentBuffer: string): string {
    try {
        if (!contentBuffer) {
            throw new ApiError('Content buffer cannot be empty', 400);
        }

        console.log('[PackageHelper] Extracting package.json from content buffer');
        
        // Decode the base64 encoded zip file to binary buffer
        const zipBuffer = Buffer.from(contentBuffer, 'base64');

        // Load buffer as zip file and extract package.json
        const zip = new AdmZip(zipBuffer);
        const zipEntries = zip.getEntries();
        const targetEntry = zipEntries.find(entry => entry.entryName.endsWith('package.json'));
        
        if (!targetEntry) {
            throw new ApiError('Package.json not found in zip content', 400);
        }

        // Parse package.json file
        const fileData = targetEntry.getData();
        const packageJson = fileData.toString('utf8');

        console.log('[PackageHelper] Successfully extracted package.json');
        return packageJson;

    } catch (error) {
        console.error('[PackageHelper] Failed to extract package.json:', error);
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to extract package.json from zip content", 400);
    }
}

/**
 * Extracts name and version from package.json content
 * @param packageJson - Raw package.json content
 * @returns Object containing Name and Version
 * @throws ApiError if name or version is missing
 */
export function extractNameAndVersionFromPackageJson(packageJson: string): { Name: string, Version: string } {
    try {
        if (!packageJson) {
            throw new ApiError('Package.json content cannot be empty', 400);
        }

        const packageData = JSON.parse(packageJson);
        const Name = packageData.name;
        const Version = packageData.version;

        if (!Name || !Version) {
            throw new ApiError('Name or version not found in package.json', 400);
        }

        console.log(`[PackageHelper] Extracted name: ${Name}, version: ${Version}`);
        return { Name, Version };
    } catch (error) {
        console.error('[PackageHelper] Failed to extract name and version:', error);
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to parse package.json content', 400);
    }
}

/**
 * Extracts GitHub repository URL from package.json
 * @param packageJson - Raw package.json content
 * @returns Normalized GitHub URL
 * @throws ApiError if GitHub URL cannot be found
 */
export async function extractGitHubLinkFromPackageJson(packageJson: string): Promise<string> {
    try {
        if (!packageJson) {
            throw new ApiError('Package.json content cannot be empty', 400);
        }

        const packageData = JSON.parse(packageJson);
        
        // Check repository field
        if (packageData.repository) {
            if (typeof packageData.repository === 'string' && packageData.repository.includes('github.com')) {
                return await normalizeToGithubUrl(packageData.repository);
            }
            if (packageData.repository.url && packageData.repository.url.includes('github.com')) {
                return await normalizeToGithubUrl(packageData.repository.url);
            }
        }
        
        // Check homepage field
        if (packageData.homepage && packageData.homepage.includes('github.com')) {
            return await normalizeToGithubUrl(packageData.homepage);
        }
        
        // Check bugs field
        if (packageData.bugs) {
            const bugsUrl = typeof packageData.bugs === 'string' ? packageData.bugs : packageData.bugs.url;
            if (bugsUrl && bugsUrl.includes('github.com')) {
                return await normalizeToGithubUrl(bugsUrl);
            }
        }

        throw new ApiError('GitHub repository URL not found in package.json', 400);

    } catch (error) {
        console.error('[PackageHelper] Failed to extract GitHub link:', error);
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to extract GitHub URL from package.json', 400);
    }
}

/**
 * Normalizes various GitHub URL formats to a standard HTTPS URL
 * @param url - Raw GitHub URL in any format
 * @returns Normalized HTTPS GitHub URL
 * @throws ApiError if URL is invalid or cannot be normalized
 */
export async function normalizeToGithubUrl(url: string): Promise<string> {
    try {
        if (!url) {
            throw new ApiError('URL cannot be empty', 400);
        }

        console.log('[PackageHelper] Original URL:', url);

        // Handle npm URLs first
        if (url.includes('npmjs.com/package/')) {
            url = await getNpmRepoURLFromGitHubURL(url);
            console.log('[PackageHelper] Converted NPM URL:', url);
        }

        // Remove git+ prefix and .git suffix
        let normalized = url
            .replace(/^git\+/, '')
            .replace(/\.git$/, '');

        // Remove authentication part (user@)
        normalized = normalized.replace(/\/\/[^@]+@/, '//');

        // Ensure proper https://github.com format
        normalized = normalized
            .replace(/^(https?:\/\/)?(github\.com)?/, 'https://github.com')
            .replace(/([^:])\/\/+/g, '$1/');  // Remove any duplicate slashes

        console.log('[PackageHelper] Normalized URL:', normalized);
        return normalized;

    } catch (error) {
        console.error('[PackageHelper] URL normalization failed:', error);
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to normalize GitHub URL', 400);
    }
}

/**
 * Extracts owner and repository name from GitHub URL
 * @param urlRepo - GitHub repository URL
 * @returns Object containing owner and repo names
 * @throws ApiError if URL format is invalid
 */
export function extractGitHubAttributesFromGitHubURL(urlRepo: string): { owner: string, repo: string } {
    try {
        if (!urlRepo || !urlRepo.includes('github.com')) {
            throw new ApiError('Invalid GitHub URL format', 400);
        }

        const parts = urlRepo.split('/');
        if (parts.length < 5) {
            throw new ApiError('Invalid GitHub URL format', 400);
        }

        const owner = parts[3].trim();
        let repo = parts[4].trim().replace('.git', '');

        console.log(`[PackageHelper] Extracted owner: ${owner}, repo: ${repo}`);
        return { owner, repo };

    } catch (error) {
        console.error('[PackageHelper] Failed to extract GitHub attributes:', error);
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to extract GitHub repository details', 400);
    }
}

/**
 * Retrieves GitHub repository URL from npm package
 * @param url - npm package URL
 * @returns GitHub repository URL
 * @throws ApiError if repository URL cannot be found
 */
export async function getNpmRepoURLFromGitHubURL(url: string): Promise<string> {
    try {
        if (!url || !url.includes('npmjs.com')) {
            throw new ApiError('Invalid npm package URL', 400);
        }

        const npmApiUrl = url
            .replace(/(?<=\/)www(?=\.)/, 'replicate')
            .replace('/package', '');
        
        console.log(`[PackageHelper] Fetching from npm API: ${npmApiUrl}`);
        
        const npmApiResponse = await fetch(npmApiUrl);
        if (!npmApiResponse.ok) {
            throw new ApiError('Failed to fetch npm package data', 400);
        }

        const npmApiData = await npmApiResponse.json();
        if (!npmApiData.repository?.url) {
            throw new ApiError('Repository URL not found in npm package data', 400);
        }

        console.log(`[PackageHelper] Found repository URL: ${npmApiData.repository.url}`);
        return npmApiData.repository.url;

    } catch (error) {
        console.error('[PackageHelper] npm URL conversion failed:', error);
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to get GitHub URL from npm package', 400);
    }
}