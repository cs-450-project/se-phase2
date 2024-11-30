/**
 * @file PackageGetterService.ts
 * Service for retrieving packages and their metadata from the database.
 * Supports querying by name, version, and ID.
 */

import { Like } from 'typeorm';
import semver from 'semver';
import { ApiError } from "../utils/errors/ApiError.js";
import { AppDataSource } from "../data-source.js";
import { PackageMetadata } from "../entities/PackageMetadata.js";
import { PackageData } from "../entities/PackageData.js";
import { PackageRating } from "../entities/PackageRating.js";
import { PackageQuery } from "../utils/types/PackageQuery.js";

/**
 * Service class for package retrieval operations
 */
export class PackageGetterService {
    /**
     * Query packages based on name and version criteria
     * @param queries Array of package queries
     * @returns Matching PackageMetadata entries
     * @throws ApiError for invalid queries or server errors
     */
    static async queryPackages(queries: PackageQuery[]): Promise<PackageMetadata[]> {
        try {
            if (!queries?.length) {
                throw new ApiError('Invalid queries: Expected non-empty array', 400);
            }

            console.log(`[PackageGetterService] Processing ${queries.length} package queries`);
            const packageMetadataRepository = AppDataSource.getRepository(PackageMetadata);
            
            // Handle wildcard query
            if (queries.some(q => q.Name?.includes("*"))) {
                console.log('[PackageGetterService] Processing wildcard query');
                return packageMetadataRepository.find();
            }

            // Process individual queries
            const results = new Set<PackageMetadata>();
            
            for (const query of queries) {
                if (!query.Name) {
                    throw new ApiError('Package name is required', 400);
                }

                const nameMatches = await this.findPackagesByName(query.Name);
                const versionMatches = query.Version ? 
                    await this.findPackagesByVersionRange(query.Version) : [];

                nameMatches.forEach(pkg => results.add(pkg));
                versionMatches.forEach(pkg => results.add(pkg));
            }

            const finalResults = Array.from(results);
            console.log(`[PackageGetterService] Found ${finalResults.length} unique matches`);
            return finalResults;

        } catch (error) {
            console.error('[PackageGetterService] Query failed:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Failed to query packages', 500);
        }
    }

    /**
     * Get package metadata and data by ID
     * @param id Package ID
     * @returns Package metadata and data
     * @throws ApiError if package not found
     */
    static async getPackageMetadataAndDataById(id: string) {
        try {
            if (!id) {
                throw new ApiError('Package ID is required', 400);
            }

            console.log(`[PackageGetterService] Fetching package: ${id}`);

            // Get metadata
            const metadata = await AppDataSource.getRepository(PackageMetadata)
                .findOne({ where: { id } });

            if (!metadata) {
                throw new ApiError('Package not found', 404);
            }

            // Get associated data
            const data = await AppDataSource.getRepository(PackageData)
                .findOne({ where: { packageId: id } });

            if (!data) {
                throw new ApiError('Package data not found', 404);
            }

            return { metadata, data };

        } catch (error) {
            console.error(`[PackageGetterService] Failed to get package ${id}:`, error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Failed to get package', 500);
        }
    }

    /**
     * Get package rating by ID
     * @param id Package ID
     * @returns Package rating metrics
     * @throws ApiError if rating not found
     */
    static async getPackageRatingFromId(id: string) {
        try {
            if (!id) {
                throw new ApiError('Package ID is required', 400);
            }

            console.log(`[PackageGetterService] Fetching rating: ${id}`);

            const rating = await AppDataSource.getRepository(PackageRating)
                .findOne({ where: { packageId: id } });

            if (!rating) {
                throw new ApiError('Package rating not found', 404);
            }

            // Transform to external rating format
            return {
                BusFactor: rating.busFactor,
                BusFactorLatency: rating.busFactorLatency,
                Correctness: rating.correctness,
                CorrectnessLatency: rating.correctnessLatency,
                RampUp: rating.rampUp,
                RampUpLatency: rating.rampUpLatency,
                ResponsiveMaintainer: rating.responsiveMaintainer,
                ResponsiveMaintainerLatency: rating.responsiveMaintainerLatency,
                LicenseScore: rating.licenseScore,
                LicenseScoreLatency: rating.licenseScoreLatency,
                GoodPinningPractice: rating.goodPinningPractice,
                GoodPinningPracticeLatency: rating.goodPinningPracticeLatency,
                PullRequest: rating.pullRequest,
                PullRequestLatency: rating.pullRequestLatency,
                NetScore: rating.netScore,
                NetScoreLatency: rating.netScoreLatency
            };

        } catch (error) {
            console.error(`[PackageGetterService] Failed to get rating ${id}:`, error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Failed to get package rating', 500);
        }
    }

    /**
     * Find packages by name pattern
     * @private
     */
    private static async findPackagesByName(name: string): Promise<PackageMetadata[]> {
        try {
            if (!name) {
                throw new ApiError('Package name is required', 400);
            }

            return await AppDataSource.getRepository(PackageMetadata)
                .find({ where: { name: Like(`%${name}%`) } });

        } catch (error) {
            console.error(`[PackageGetterService] Name search failed: ${name}`, error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Failed to search by name', 500);
        }
    }

    /**
     * Parse version query string
     * @private
     */
    private static parseVersionQuery(query: string): {
        type: 'exact' | 'range' | 'caret' | 'tilde';
        value: string;
    } {
        if (!query?.trim()) {
            throw new ApiError('Version query is required', 400);
        }

        const trimmed = query.trim();

        if (trimmed.startsWith('^')) return { type: 'caret', value: trimmed };
        if (trimmed.startsWith('~')) return { type: 'tilde', value: trimmed };
        if (trimmed.includes(' ')) return { type: 'range', value: trimmed };
        return { type: 'exact', value: trimmed };
    }

    /**
     * Find packages matching version criteria
     * @private
     */
    private static async findPackagesByVersionRange(version: string): Promise<PackageMetadata[]> {
        try {
            if (!version) {
                throw new ApiError('Version is required', 400);
            }

            const allPackages = await AppDataSource.getRepository(PackageMetadata)
                .find({ order: { version: 'DESC' } });

            const { type, value } = this.parseVersionQuery(version);

            return allPackages.filter(pkg => {
                switch (type) {
                    case 'exact':
                        return semver.eq(pkg.version, value);
                    case 'range': {
                        const [min, max] = value.split(' ');
                        return semver.gte(pkg.version, min) && 
                               semver.lte(pkg.version, max);
                    }
                    case 'caret':
                    case 'tilde':
                        return semver.satisfies(pkg.version, value);
                    default:
                        return false;
                }
            });

        } catch (error) {
            console.error(`[PackageGetterService] Version search failed: ${version}`, error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Failed to search by version', 500);
        }
    }
}