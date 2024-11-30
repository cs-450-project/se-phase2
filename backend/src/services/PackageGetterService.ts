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
import { FormattedPackageMetadata } from "../utils/types/FormattedPackageMetadata.js";

/**
 * Service class for package retrieval operations
 */
export class PackageGetterService {
    /**
     * Query packages based on name and version criteria
     * @param queries Array of package queries
     * @param offset Pagination offset
     * @returns Object containing results and next offset
     * @throws ApiError for invalid queries or server errors
     */
    static async queryPackages(queries: PackageQuery[], offset?: string): Promise<{
        packages: FormattedPackageMetadata[],
        nextOffset: string | undefined
    }> {
        try {
            if (!queries?.length) {
                throw new ApiError('Invalid queries: Expected non-empty array', 400);
            }

            const packageMetadataRepository = AppDataSource.getRepository(PackageMetadata);
            const pageSize = 10; // Define your desired page size
            const currentOffset = offset ? parseInt(offset) : 0;
            
            let results: PackageMetadata[] = [];

            // Handle wildcard query for listing all packages
            if (queries.length === 1 && queries[0].Name === '*') {
                results = await packageMetadataRepository.find({
                    skip: currentOffset,
                    take: pageSize + 1, // Get one extra to check if there are more
                    order: { name: 'ASC', version: 'DESC' }
                });
            } else {
                // Process individual queries
                const matchedPackages = new Set<PackageMetadata>();
                
                for (const query of queries) {
                    if (!query.Name) {
                        throw new ApiError('Package name is required', 400);
                    }

                    let packageMatches: PackageMetadata[] = [];
                    
                    // First find by name
                    const nameMatches = await packageMetadataRepository.find({
                        where: { name: query.Name },
                        order: { version: 'DESC' }
                    });

                    // If version is specified, filter by version
                    if (query.Version && nameMatches.length > 0) {
                        packageMatches = nameMatches.filter(pkg => {
                            return this.matchesVersionQuery(pkg.version, query.Version!);
                        });
                    } else {
                        packageMatches = nameMatches;
                    }

                    packageMatches.forEach(pkg => matchedPackages.add(pkg));
                }

                // Apply pagination to the combined results
                results = Array.from(matchedPackages)
                    .sort((a, b) => a.name.localeCompare(b.name) || semver.rcompare(a.version, b.version))
                    .slice(currentOffset, currentOffset + pageSize + 1);
            }

            // Check if there are more results
            const hasMore = results.length > pageSize;
            if (hasMore) {
                results.pop(); // Remove the extra item we fetched
            }

            // Format results
            const formattedResults = results.map(pkg => ({
                Version: pkg.version,
                Name: pkg.name,
                ID: pkg.id
            }));

            return {
                packages: formattedResults,
                nextOffset: hasMore ? (currentOffset + pageSize).toString() : undefined
            };

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

            return {
                metadata: { 
                    Name: metadata.name, 
                    Version: metadata.version, 
                    ID: metadata.id 
                },
                data: { 
                    Content: data.content, 
                    ...(data.url && { URL: data.url }),
                    JSProgram: data.jsProgram 
                }
            };

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
     * Check if a version matches a version query
     * @private
     */
    private static matchesVersionQuery(version: string, query: string): boolean {
        try {
            query = query.trim();
            
            // Bounded range (e.g., "1.2.3-2.1.0")
            if (query.includes('-')) {
                const [minVersion, maxVersion] = query.split('-').map(v => v.trim());
                
                // Validate both versions are valid semver
                if (!semver.valid(minVersion) || !semver.valid(maxVersion)) {
                    console.error(`Invalid version range: ${query}`);
                    return false;
                }
                
                return semver.gte(version, minVersion) && 
                    semver.lte(version, maxVersion);
            }
            
            // Exact version match
            if (semver.valid(query)) {
                return semver.eq(version, query);
            }
            
            // Caret or tilde ranges
            if (query.startsWith('^') || query.startsWith('~')) {
                return semver.satisfies(version, query);
            }

            console.error(`Unsupported version query format: ${query}`);
            return false;
        } catch (error) {
            console.error(`Error processing version query: ${query}`, error);
            return false;
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

};