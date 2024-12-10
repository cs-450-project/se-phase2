/**
 * @file PackageGetterService.ts
 * Service for retrieving packages and their metadata from the database.
 * Supports querying by name, version, and ID.
 */

import semver from 'semver';
import { ApiError } from "../utils/errors/ApiError.js";
import { AppDataSource } from "../data-source.js";
import { PackageMetadata } from "../entities/PackageMetadata.js";
import { PackageData } from "../entities/PackageData.js";
import { PackageRating } from "../entities/PackageRating.js";
import { PackageQuery } from "../utils/types/PackageQuery.js";
import { FormattedPackageMetadata } from "../utils/types/FormattedPackageMetadata.js";
import { PackageRegExDto } from "../utils/types/PackageRegExDto.js";
import { QueryRunner } from 'typeorm';


// Define interfaces for our return types
interface PackageMetadataResponse {
    Name: string;
    Version: string;
    ID: string;
}

interface PackageDataResponse {
    Content?: string;
    URL?: string;
    JSProgram?: string;
}

interface PackageResponse {
    metadata: PackageMetadataResponse;
    data: PackageDataResponse;
}

/**
 * @class PackageGetterService
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
    static async getPackageMetadataAndDataById(id: string): Promise<PackageResponse> {
        let queryRunner: QueryRunner | null = null;

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

            // Get the content size and other package data
            const packageData = await AppDataSource.getRepository(PackageData)
                .createQueryBuilder('data')
                .select(['data.content', 'data.url', 'data.jsProgram'])
                .where('data.packageId = :id', { id })
                .getOne();

            if (!packageData) {
                throw new ApiError('Package data not found', 404);
            }

            // Structure the response with proper typing
            return {
                metadata: {
                    Name: metadata.name,
                    Version: metadata.version,
                    ID: metadata.id
                },
                data: {
                    Content: packageData.content?.toString('base64'),
                    ...(packageData.url && { URL: packageData.url }),
                    JSProgram: packageData.jsProgram
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
     * Get package cost by ID
     * @param id Package ID
     * @returns Package cost metrics
     * @throws ApiError if cost not found
     */
    static async searchByRegex(regExDto: PackageRegExDto): Promise<FormattedPackageMetadata[]> {
        try {

            console.log(`[PackageGetterService] Searching by regex: ${regExDto.RegEx}`);
            
            const packageMetadataRepository = AppDataSource.getRepository(PackageMetadata);

            // Check that the regex query is provided
            if (!regExDto?.RegEx) {
                throw new ApiError('Regex query is required', 400);
            }

            // Ensure that the regex query is valid
            try {
                new RegExp(regExDto.RegEx);
            } catch (error) {
                throw new ApiError('Invalid regex query', 400);
            }

            // Search both name and readme by joining with PackageData
            const packages = await packageMetadataRepository
            .createQueryBuilder('pm')
            .leftJoin(PackageData, 'pd', 'pd.package_id = pm.id')
            // Use Postgres ~ operator for regex matching
            .where('pm.name ~ :pattern', { pattern: regExDto.RegEx })
            .orWhere('pd.readme ~ :pattern', { pattern: regExDto.RegEx })
            .select(['pm.id', 'pm.name', 'pm.version'])
            .distinct(true)
            .getMany();

            // Format results
            if (!packages.length) {
                throw new ApiError('No packages found', 404);
            }
            const formattedResults = packages.map(pkg => ({
                Version: pkg.version,
                Name: pkg.name,
                ID: pkg.id
            }));

            return formattedResults;

        } catch (error) {
            console.error('[PackageGetterService] Regex search failed:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Failed to search by regex', 500);
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

};