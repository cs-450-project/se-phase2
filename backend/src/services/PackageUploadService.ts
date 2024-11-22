/** 
 * @file src/services/PackageUploadService.ts
 * Service contains the business logic for uploading a package to the database.
 */

import axios from 'axios';
import { ApiError } from "../utils/errors/ApiError.js";
import { AppDataSource } from "../data-source.js";
import { PackageMetadata } from "../entities/PackageMetadata.js";
import { PackageData } from "../entities/PackageData.js";
import { PackageRating } from "../entities/PackageRating.js";
import { evaluateMetrics } from './evaluators/evaluateMetrics.js';
import { 
    getPackageJsonFromContentBuffer, 
    extractNameAndVersionFromPackageJson, 
    extractGitHubAttributesFromGitHubURL, 
    normalizeToGithubUrl, 
    extractGitHubLinkFromPackageJson 
} from '../utils/packageHelpers.js';
import octokit from '../utils/octokit.js';

/**
 * @class PackageUploadService
 * Service class that handles package uploads to the database.
 * Supports both direct content uploads and URL-based uploads.
 */
export class PackageUploadService {
    
    /**
     * Uploads a package using Base64 encoded zip content
     * @param Content - Base64 encoded zip file
     * @param JSProgram - Base64 encoded JavaScript program
     * @param debloat - Boolean indicating whether to debloat the package
     * @returns Object containing metadata and data of the uploaded package
     * @throws ApiError if package exists or invalid input
     */
    static async uploadContentType(Content: string, JSProgram: string, debloat: boolean) {
        try {
            if (!Content) {
                throw new ApiError('Content cannot be empty', 400);
            }

            console.log('[PackageService] Processing Content type package');

            // Extract and validate package information
            const packageJson = await getPackageJsonFromContentBuffer(Content);
            if (!packageJson) {
                throw new ApiError('Invalid package.json in zip content', 400);
            }

            const { Name, Version } = extractNameAndVersionFromPackageJson(packageJson);
            if (!Name || !Version) {
                throw new ApiError('Invalid name or version in package.json', 400);
            }

            // Check for existing package
            const packageMetadataRepository = AppDataSource.getRepository(PackageMetadata);
            const existingMetadata = await packageMetadataRepository.findOne({ 
                where: { name: Name, version: Version },
            });

            if (existingMetadata) {
                throw new ApiError(`Package ${Name}@${Version} already exists`, 409);
            }

            // Extract GitHub information
            const githubLink = await extractGitHubLinkFromPackageJson(packageJson);
            if (!githubLink) {
                throw new ApiError('No GitHub repository found in package.json', 400);
            }

            const { owner, repo } = extractGitHubAttributesFromGitHubURL(githubLink);
            
            // Evaluate metrics
            const scorecard = await evaluateMetrics(owner, repo);
            console.log(`[PackageService] Metrics evaluation complete: ${JSON.stringify(scorecard)}`);

            // Check if package meets quality standards
            if (scorecard.netScore < 0.5) {
                throw new ApiError('Package does not meet quality standards', 424);
            }

            // Save metadata
            const metadata = packageMetadataRepository.create({ name: Name, version: Version });
            await packageMetadataRepository.save(metadata);
            console.log(`[PackageService] Saved metadata for ${Name}@${Version}`);

            // Save package data
            const packageDataRepository = AppDataSource.getRepository(PackageData);
            const data = packageDataRepository.create({
                packageMetadata: metadata,
                content: Content,
                debloat: debloat,
                jsProgram: JSProgram,
            });
            await packageDataRepository.save(data);
            console.log(`[PackageService] Saved package data for ${Name}@${Version}`);

            // Save package rating
            const packageRating = this.createPackageRatingFromScorecard(scorecard, metadata);
            const packageRatingRepository = AppDataSource.getRepository(PackageRating);
            await packageRatingRepository.save(packageRating);

            return {
                metadata: { Name, Version, ID: metadata.id },
                data: { Content: data.content, JSProgram: data.jsProgram }
            };

        } catch (error) {
            console.error('[PackageService] Upload failed:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Failed to upload package', 500);
        }
    }

    /**
     * Uploads a package from a URL
     * @param URL - URL of the package (npm or GitHub)
     * @param JSProgram - Base64 encoded JavaScript program
     * @returns Object containing metadata and data of the uploaded package
     * @throws ApiError if package exists or invalid input
     */
    static async uploadURLType(URL: string, JSProgram: string) {
        try {
            if (!URL) {
                throw new ApiError('URL cannot be empty', 400);
            }

            console.log('[PackageService] Processing URL type package');

            // Get content from URL
            const Content = await this.getContentZipBufferFromGithubUrl(URL);
            if (!Content) {
                throw new ApiError('Failed to fetch package content', 400);
            }

            // Extract package information
            const packageJson = await getPackageJsonFromContentBuffer(Content);
            if (!packageJson) {
                throw new ApiError('Invalid package.json in content', 400);
            }

            const { Name, Version } = extractNameAndVersionFromPackageJson(packageJson);
            if (!Name || !Version) {
                throw new ApiError('Invalid name or version in package.json', 400);
            }

            // Process GitHub URL
            const normalizedUrl = await normalizeToGithubUrl(URL);
            const { owner, repo } = extractGitHubAttributesFromGitHubURL(normalizedUrl);

            // Evaluate metrics
            const scorecard = await evaluateMetrics(owner, repo);
            console.log(`[PackageService] Metrics evaluation complete: ${JSON.stringify(scorecard)}`);

            // Check if package meets quality standards
            if (scorecard.netScore < 0.5) {
                throw new ApiError('Package does not meet quality standards', 424);
            }

            // Save metadata
            const packageMetadataRepository = AppDataSource.getRepository(PackageMetadata);
            const metadata = packageMetadataRepository.create({ name: Name, version: Version });
            await packageMetadataRepository.save(metadata);
            console.log(`[PackageService] Saved metadata for ${Name}@${Version}`);

            // Save package data
            const packageDataRepository = AppDataSource.getRepository(PackageData);
            const data = packageDataRepository.create({
                packageMetadata: metadata,
                content: Content,
                debloat: false,
                jsProgram: JSProgram,
            });
            await packageDataRepository.save(data);
            console.log(`[PackageService] Saved package data for ${Name}@${Version}`);

            // Save package rating
            const packageRating = this.createPackageRatingFromScorecard(scorecard, metadata);
            const packageRatingRepository = AppDataSource.getRepository(PackageRating);
            await packageRatingRepository.save(packageRating);

            return {
                metadata: { Name, Version, ID: metadata.id },
                data: { Content: data.content, JSProgram: data.jsProgram }
            };

        } catch (error) {
            console.error('[PackageService] URL upload failed:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Failed to upload package from URL', 500);
        }
    }

    /**
     * Fetches and processes GitHub URL content
     * @param URL - GitHub or npm package URL
     * @returns Base64 encoded zip content
     * @throws ApiError if URL is invalid or content cannot be fetched
     */
    private static async getContentZipBufferFromGithubUrl(URL: string): Promise<string> {
        try {
            const githubUrl = await normalizeToGithubUrl(URL);
            const { owner, repo } = extractGitHubAttributesFromGitHubURL(githubUrl);
            const defaultBranch = await this.getDefaultBranch(owner, repo);

            const normalizedURL = `https://github.com/${owner}/${repo}/archive/${defaultBranch}.zip`;
            const response = await axios.get(normalizedURL, { 
                responseType: 'arraybuffer',
                timeout: 5000 // 5 second timeout
            });

            return Buffer.from(response.data, 'binary').toString('base64');

        } catch (error) {
            console.error('[PackageService] Failed to fetch GitHub content:', error);
            throw new ApiError('Failed to fetch package content from GitHub', 400);
        }
    }

    /**
     * Gets the default branch of a GitHub repository
     * @param owner - Repository owner
     * @param repo - Repository name
     * @returns Default branch name (e.g., main, master)
     * @throws ApiError if branch cannot be determined
     */
    private static async getDefaultBranch(owner: string, repo: string): Promise<string> {
        try {
            const response = await octokit.repos.get({ owner, repo });
            return response.data.default_branch;
        } catch (error) {
            console.error('[PackageService] Failed to get default branch:', error);
            throw new ApiError('Failed to determine repository default branch', 400);
        }
    }

    /**
     * Creates a PackageRating object from a scorecard
     * @param scorecard - Object containing metric scores
     * @param metadata - PackageMetadata object
     * @returns PackageRating object
     * @throws ApiError if scorecard is invalid
     */

    private static createPackageRatingFromScorecard(scorecard: any, metadata: PackageMetadata) {
        try {
            if (!scorecard || !metadata) {
                throw new ApiError('Invalid scorecard or metadata', 400);
            }

            const packageRating = new PackageRating();
            packageRating.packageMetadata = metadata;

            packageRating.bus_factor = scorecard.busFactor;
            packageRating.bus_factor_latency = scorecard.busFactorLatency;
            packageRating.correctness = scorecard.correctness;
            packageRating.correctness_latency = scorecard.correctnessLatency;
            packageRating.ramp_up = scorecard.rampUp;
            packageRating.ramp_up_latency = scorecard.rampUpLatency;
            packageRating.responsive_maintainer = scorecard.responsiveMaintainer;
            packageRating.responsive_maintainer_latency = scorecard.responsiveMaintainerLatency;
            packageRating.license_score = scorecard.licenseScore;
            packageRating.license_score_latency = scorecard.licenseScoreLatency;
            packageRating.good_pinning_practice = scorecard.goodPinningPractice;
            packageRating.good_pinning_practice_latency = scorecard.goodPinningPracticeLatency;
            packageRating.pull_request = scorecard.pullRequest;
            packageRating.pull_request_latency = scorecard.pullRequestLatency;
            packageRating.net_score = scorecard.netScore;
            packageRating.net_score_latency = scorecard.netScoreLatency;

            return packageRating;

        } catch (error) {
            console.error('[PackageService] Failed to create PackageRating:', error);
            throw new ApiError('Failed to create PackageRating object', 500);
        }
    }

}