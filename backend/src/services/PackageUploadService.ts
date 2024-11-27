/** 
 * @file src/services/PackageUploadService.ts
 * Service contains the business logic for uploading a package to the database.
 */

import axios from 'axios';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { ApiError } from "../utils/errors/ApiError.js";
import { AppDataSource } from "../data-source.js";
import { PackageMetadata } from "../entities/PackageMetadata.js";
import { PackageData } from "../entities/PackageData.js";
import { PackageRating } from "../entities/PackageRating.js";
import { evaluateMetrics } from './evaluators/evaluateMetrics.js';
import { 
    getPackageJsonFromContentBuffer, 
    extractNameAndVersionFromPackageJson, 
    extractGithubAttributesFromGithubUrl, 
    normalizeToGithubUrl, 
    extractGithubUrlFromPackageJson,
    getContentZipBufferFromGithubUrl 
} from '../utils/packageHelpers.js';


/**
 * Debloat rules for removing unnecessary files
 * Each rule is a regex pattern matching files to remove
 */
const DEBLOAT_RULES: Array<{
    pattern: RegExp;
    description: string;
}> = [
    { pattern: /\.test\.(js|ts|jsx|tsx)$/, description: 'Test files' },
    { pattern: /\.(md|markdown)$/, description: 'Documentation files' },
    { pattern: /__(tests|mocks|fixtures)__/, description: 'Test directories' },
    { pattern: /\.(log|lock)$/, description: 'Log and lock files' },
    { pattern: /^(tests?|spec|docs|examples?|samples?)\//, description: 'Common test/doc directories' }
];


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
    static async uploadContentType(content: string, jsProgram: string, shouldDebloat: boolean) {
        try {
            if (!content) {
                throw new ApiError('Content cannot be empty', 400);
            }

            console.log('[PackageService] Processing Content type package');

            // Extract and validate package information
            const packageJson = await getPackageJsonFromContentBuffer(content);
            if (!packageJson) {
                throw new ApiError('Invalid package.json in zip content', 400);
            }

            const { name, version } = extractNameAndVersionFromPackageJson(packageJson);
            if (!name || !version) {
                throw new ApiError('Invalid name or version in package.json', 400);
            }

            // Check for existing package
            const packageMetadataRepository = AppDataSource.getRepository(PackageMetadata);
            const existingMetadata = await packageMetadataRepository.findOne({ 
                where: { name: name, version: version },
            });

            if (existingMetadata) {
                throw new ApiError(`Package ${name}@${version} already exists`, 409);
            }

            // Check for debloat flag
            if (shouldDebloat) {
                content = await this.getDebloatedZipBuffer(content);
            }

            // Extract GitHub information
            const githubLink = await extractGithubUrlFromPackageJson(packageJson);
            if (!githubLink) {
                throw new ApiError('No GitHub repository found in package.json', 400);
            }

            const { owner, repo } = extractGithubAttributesFromGithubUrl(githubLink);
            
            // Evaluate metrics
            const scorecard = await evaluateMetrics(owner, repo);
            console.log(`[PackageService] Metrics evaluation complete: ${JSON.stringify(scorecard)}`);

            // Check if package meets quality standards
            if (scorecard.netScore < 0.5) {
                throw new ApiError('Package does not meet quality standards', 424);
            }

            // Save metadata
            const metadata = packageMetadataRepository.create({ name: name, version: version });
            await packageMetadataRepository.save(metadata);
            console.log(`[PackageService] Saved metadata for ${name}@${version}`);

            // Save package data
            const packageDataRepository = AppDataSource.getRepository(PackageData);
            const data = packageDataRepository.create({
                packageMetadata: metadata,
                content: content,
                debloat: shouldDebloat,
                jsProgram: jsProgram,
            });
            await packageDataRepository.save(data);
            console.log(`[PackageService] Saved package data for ${name}@${version}`);

            // Save package rating
            const packageRating = this.createPackageRatingFromScorecard(scorecard, metadata);
            const packageRatingRepository = AppDataSource.getRepository(PackageRating);
            await packageRatingRepository.save(packageRating);

            return {
                metadata: { 
                    Name: metadata.name, 
                    Version: metadata.version, 
                    ID: metadata.id 
                },
                data: { 
                    Content: data.content, 
                    JSProgram: data.jsProgram 
                }
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
    static async uploadUrlType(url: string, jsProgram: string) {
        try {
            if (!url) {
                throw new ApiError('URL cannot be empty', 400);
            }

            console.log('[PackageService] Processing URL type package');

            // Get content from URL
            const contentFromUrl = await getContentZipBufferFromGithubUrl(url);
            if (!contentFromUrl) {
                throw new ApiError('Failed to fetch package content', 400);
            }

            // Extract package information
            const packageJson = await getPackageJsonFromContentBuffer(contentFromUrl);
            if (!packageJson) {
                throw new ApiError('Invalid package.json in content', 400);
            }

            const { name, version } = extractNameAndVersionFromPackageJson(packageJson);
            if (!name || !version) {
                throw new ApiError('Invalid name or version in package.json', 400);
            }

            // Check for existing package
            const packageMetadataRepository = AppDataSource.getRepository(PackageMetadata);
            const existingMetadata = await packageMetadataRepository.findOne({ 
                where: { name: name, version: version },
            });

            if (existingMetadata) {
                throw new ApiError(`Package ${name}@${version} already exists`, 409);
            }

            // Process GitHub URL
            const normalizedUrl = await normalizeToGithubUrl(url);
            const { owner, repo } = extractGithubAttributesFromGithubUrl(normalizedUrl);

            // Evaluate metrics
            const scorecard = await evaluateMetrics(owner, repo);
            console.log(`[PackageService] Metrics evaluation complete: ${JSON.stringify(scorecard)}`);

            // Check if package meets quality standards
            if (scorecard.netScore < 0.5) {
                throw new ApiError('Package does not meet quality standards', 424);
            }

            // Save metadata
            const metadata = packageMetadataRepository.create({ name: name, version: version });
            await packageMetadataRepository.save(metadata);
            console.log(`[PackageService] Saved metadata for ${name}@${version}`);

            // Save package data
            const packageDataRepository = AppDataSource.getRepository(PackageData);
            const data = packageDataRepository.create({
                packageMetadata: metadata,
                content: contentFromUrl,
                url: url,
                jsProgram: jsProgram,
            });
            await packageDataRepository.save(data);
            console.log(`[PackageService] Saved package data for ${name}@${version}`);

            // Save package rating
            const packageRating = this.createPackageRatingFromScorecard(scorecard, metadata);
            const packageRatingRepository = AppDataSource.getRepository(PackageRating);
            await packageRatingRepository.save(packageRating);

            return {
                metadata: { 
                    Name: metadata.name, 
                    Version: metadata.version, 
                    ID: metadata.id 
                },
                data: { 
                    Content: data.content, 
                    URL: data.url, 
                    JSProgram: data.jsProgram 
                }
            };

        } catch (error) {
            console.error('[PackageService] URL upload failed:', error);
            if (error instanceof ApiError) throw error;
            console.log(error);
            throw new ApiError('Failed to upload package from URL', 500);
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

            packageRating.busFactor = scorecard.busFactor;
            packageRating.busFactorLatency = scorecard.busFactorLatency;
            packageRating.correctness = scorecard.correctness;
            packageRating.correctnessLatency = scorecard.correctnessLatency;
            packageRating.rampUp = scorecard.rampUp;
            packageRating.rampUpLatency = scorecard.rampUpLatency;
            packageRating.responsiveMaintainer = scorecard.responsiveMaintainers;
            packageRating.responsiveMaintainerLatency = scorecard.responsiveMaintainersLatency;
            packageRating.licenseScore = scorecard.license;
            packageRating.licenseScoreLatency = scorecard.licenseLatency;
            packageRating.goodPinningPractice = scorecard.dependencyPinning;
            packageRating.goodPinningPracticeLatency = scorecard.dependencyPinningLatency;
            packageRating.pullRequest = scorecard.codeReview;
            packageRating.pullRequestLatency = scorecard.codeReviewLatency;
            packageRating.netScore = scorecard.netScore;
            packageRating.netScoreLatency = scorecard.netScoreLatency;

            return packageRating;

        } catch (error) {
            console.error('[PackageService] Failed to create PackageRating:', error);
            throw new ApiError('Failed to create PackageRating object', 500);
        }
    }

    

        /**
     * Removes unnecessary files from a package based on debloat rules
     * @param Content - Base64 encoded zip content
     * @throws ApiError if debloat process fails
     */
    private static async debloatPackage(Content: string, tempDir: string): Promise<void> {
        try {
            if (!Content) {
                throw new ApiError('Content cannot be empty', 400);
            }

            console.log('[PackageService] Starting package debloat process');

            // Create zip from content
            const zipBuffer = Buffer.from(Content, 'base64');
            const zip = new AdmZip(zipBuffer);

            // Extract to temp directory
            try {
                zip.extractAllTo(tempDir, true);
                console.log(`[PackageService] Extracted package to ${tempDir}`);
            } catch (error) {
                throw new ApiError('Failed to extract package content', 500);
            }

            // Process files recursively
            await this.removeUnnecessaryFiles(tempDir);
            console.log('[PackageService] Completed package debloat process');

        } catch (error) {
            console.error('[PackageService] Debloat process failed:', error);
            throw new ApiError('Failed to debloat package', 500);
        }
    }

    /**
     * Recursively removes files matching debloat rules
     * @param dir - Directory to process
     * @throws ApiError if file operations fail
     */
    private static async removeUnnecessaryFiles(dir: string): Promise<void> {
        try {
            const entries = await fs.promises.readdir(dir);

            for (const entry of entries) {
                const fullPath = path.join(dir, entry);
                const stats = await fs.promises.stat(fullPath);

                if (stats.isDirectory()) {
                    // Process subdirectory
                    await this.removeUnnecessaryFiles(fullPath);

                    // Remove if empty
                    const remaining = await fs.promises.readdir(fullPath);
                    if (remaining.length === 0) {
                        await fs.promises.rmdir(fullPath);
                        console.log(`[PackageService] Removed empty directory: ${fullPath}`);
                    }
                } else {
                    // Check file against debloat rules
                    const matchedRule = DEBLOAT_RULES.find(rule => rule.pattern.test(entry));
                    if (matchedRule) {
                        await fs.promises.unlink(fullPath);
                        console.log(`[PackageService] Removed ${matchedRule.description}: ${fullPath}`);
                    }
                }
            }
        } catch (error) {
            console.error(`[PackageService] Error processing directory ${dir}:`, error);
            throw new ApiError('Failed to process directory during debloat', 500);
        }
    }

    /**
     * Creates a debloated zip buffer from the processed content
     * @param Content - Original base64 encoded zip content
     * @returns Debloated base64 encoded zip content
     * @throws ApiError if zip operations fail
     */
    private static async getDebloatedZipBuffer(Content: string): Promise<string> {
        const tempDir = path.join(process.cwd(), 'temp', Date.now().toString());

        try {
            // Create temp directory
            await fs.promises.mkdir(tempDir, { recursive: true });
            console.log(`[PackageService] Created temporary directory: ${tempDir}`);

            // Process package
            await this.debloatPackage(Content, tempDir);

            // Create new zip
            const zip = new AdmZip();
            zip.addLocalFolder(tempDir);
            const zipBuffer = zip.toBuffer();

            console.log('[PackageService] Created debloated zip package');
            return zipBuffer.toString('base64');

        } catch (error) {
            console.error('[PackageService] Failed to create debloated package:', error);
            throw new ApiError('Failed to create debloated package', 500);

        } finally {
            // Cleanup temp directory
            try {
                await fs.promises.rm(tempDir, { recursive: true, force: true });
                console.log(`[PackageService] Cleaned up temporary directory: ${tempDir}`);
            } catch (error) {
                console.error(`[PackageService] Failed to cleanup temporary directory ${tempDir}:`, error);
            }
        }
    }

};