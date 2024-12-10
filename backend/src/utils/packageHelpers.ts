/**
 * @file packageDataHelpers.ts
 * Utility functions for package data extraction and URL manipulation
 */

import AdmZip from "adm-zip";
import axios from "axios";
import octokit from "./octokit.js";
import { ApiError } from "./errors/ApiError.js";

/**
 * Extracts and returns package.json content from a base64 encoded zip buffer
 * @param contentBuffer - Base64 encoded zip file content
 * @returns Package.json content as string
 * @throws ApiError if package.json cannot be found or extracted
 */
export async function getPackageJsonFromContentBuffer(contentBuffer: string): Promise<string> {
    try {
        if (!contentBuffer) {
            throw new ApiError('Content buffer cannot be empty', 400);
        }

        console.log('[PackageHelper] Extracting package.json from content buffer');
        
        const zipBuffer = Buffer.from(contentBuffer, 'base64');
        const zip = new AdmZip(zipBuffer);
        const zipEntries = zip.getEntries();

        // Find root package.json (shortest valid path)
        const packageJsonEntries = zipEntries
            .filter(entry => entry.entryName.endsWith('package.json'))
            .sort((a, b) => a.entryName.length - b.entryName.length);

        // Get the root-most package.json
        const targetEntry = packageJsonEntries[0];
        
        if (!targetEntry) {
            throw new ApiError('Package.json not found in zip content', 400);
        }

        console.log('[PackageHelper] Using package.json from:', targetEntry.entryName);

        const fileData = targetEntry.getData();
        const packageJson = fileData.toString('utf8');

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
export function extractNameAndVersionFromPackageJson(packageJson: string): { packageJsonName: string | null, packageJsonVersion: string | null } {
    try {
        if (!packageJson) {
            throw new ApiError('Package.json content cannot be empty', 400);
        }

        const packageData = JSON.parse(packageJson);
        const packageJsonName = packageData.name || null;
        var packageJsonVersion = packageData.version || null;

        console.log(`[PackageHelper] Extracted name: ${packageJsonName}, version: ${packageJsonVersion}`);
        return { packageJsonName, packageJsonVersion };
    } catch (error) {
        console.error('[PackageHelper] Failed to extract name and version:', error);
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to extract name and version from package.json', 400);
    }
}

/**
 * Extracts GitHub repository URL from package.json
 * @param packageJson - Raw package.json content
 * @returns Normalized GitHub URL
 * @throws ApiError if GitHub URL cannot be found
 */
export async function extractGithubUrlFromPackageJson(packageJson: string): Promise<string> {
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
            url = await getNpmRepoUrlFromGithubUrl(url);
            console.log('[PackageHelper] Converted NPM URL:', url);
        }

        // Clean the URL
        let normalized = url
            .replace(/^(git:\/\/|git\+https:\/\/|https:\/\/|http:\/\/)/, '') // Remove all protocols
            .replace(/\.git$/, '')  // Remove .git suffix
            .replace(/\/issues$/, '') // Remove issues suffix
            .replace(/\/\/+/g, '/') // Remove duplicate slashes
            .replace(/^github.com:/, '') // Remove SSH format
            .replace(/\/+$/, '');   // Remove trailing slashes

        // Remove authentication
        normalized = normalized.replace(/([^@]+@)/, '');

        // Ensure github.com is at the start
        if (!normalized.startsWith('github.com')) {
            normalized = `github.com/${normalized}`;
        }

        // Clean up any residual github.com duplicates
        normalized = normalized.replace(/github\.com\/github\.com/, 'github.com');

        // Add https protocol
        normalized = `https://${normalized}`;

        console.log('[PackageHelper] Normalized URL:', normalized);
        
        // Validate final URL format
        if (!normalized.match(/^https:\/\/github\.com\/[\w-]+\/[\w-]+$/)) {
            throw new ApiError('Invalid GitHub URL format after normalization', 400);
        }

        return normalized;

    } catch (error) {
        console.error('[PackageHelper] URL normalization failed:', error);
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to normalize GitHub URL', 400);
    }
}

/**
 * Extracts owner and repository name from GitHub URL
 * @param repoUrl - GitHub repository URL
 * @returns Object containing owner and repo names
 * @throws ApiError if URL format is invalid
 */
export function extractGithubAttributesFromGithubUrl(repoUrl: string): { owner: string, repo: string } {
    try {
        if (!repoUrl || !repoUrl.includes('github.com')) {
            throw new ApiError('Invalid GitHub URL format', 400);
        }

        const parts = repoUrl.split('/');
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
export async function getNpmRepoUrlFromGithubUrl(url: string): Promise<string> {
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

/**
     * Fetches and processes GitHub URL content
     * @param URL - GitHub or npm package URL
     * @returns Base64 encoded zip content
     * @throws ApiError if URL is invalid or content cannot be fetched
     */
export async function getContentZipBufferFromGithubUrl(version: string, owner: string, repo: string): Promise<Buffer> {
    try {
        const branchOrVersion = version || await getDefaultBranch(owner, repo);

        const normalizedURL = `https://github.com/${owner}/${repo}/archive/${branchOrVersion}.zip`;
        const response = await axios.get(normalizedURL, { 
            responseType: 'arraybuffer',
            timeout: 5000 // 5 second timeout
        });

        return Buffer.from(response.data);

    } catch (error) {
        console.error('[PackageService] Failed to fetch GitHub content... retrying');
        if (axios.isAxiosError(error) && error.response?.status === 404 && version) {
            // Add a 'v' prefix to the version and try again
            const vVersion = version ? `v${version}` : '';
            const normalizedURL = `https://github.com/${owner}/${repo}/archive/${vVersion}.zip`;
            const response = await axios.get(normalizedURL, { 
                responseType: 'arraybuffer',
                timeout: 5000 // 5 second timeout
            });
            return Buffer.from(response.data);
        } else {
            console.error('[PackageService] Failed to fetch GitHub content:', error);
            throw new ApiError('Failed to fetch package content from GitHub', 400);
        }
    }
}

/**
 * Gets the default branch of a GitHub repository
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Default branch name (e.g., main, master)
 * @throws ApiError if branch cannot be determined
 */
export async function getDefaultBranch(owner: string, repo: string): Promise<string> {
    try {
        const response = await octokit.repos.get({ owner, repo });
        return response.data.default_branch;
    } catch (error) {
        console.error('[PackageService] Failed to get default branch:', error);
        throw new ApiError('Failed to determine repository default branch', 400);
    }
}


export async function getPackageJsonFromGithubUrl(owner: string, repo: string): Promise<string> {
    try {
        const response = await octokit.repos.getContent({
            owner,
            repo,
            path: 'package.json',
        });

        // The response content is Base64 encoded, so we need to decode it
        if ('content' in response.data && !Array.isArray(response.data)) {
            const content = Buffer.from(response.data.content, 'base64').toString();
            return content;
        }

        throw new ApiError('Failed to get package.json from GitHub repository', 400);
    } catch (error) {
        console.error('[PackageService] Failed to get package.json:', error);
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to get package.json from GitHub repository', 400);
    }
}
