/**
 * @file PackageCostService.ts
 * Service for calculating package sizes and dependency costs.
 * Handles both direct package measurements and npm registry lookups.
 */

import { AppDataSource } from "../data-source.js";
import { PackageMetadata } from "../entities/PackageMetadata.js";
import { PackageData } from "../entities/PackageData.js";
import { PackageCosts } from "../entities/PackageCosts.js";
import { ApiError } from "../utils/errors/ApiError.js";
import { getPackageJsonFromContentBuffer } from "../utils/packageHelpers.js";
import fetch from 'node-fetch';
import * as semver from 'semver';

// Constants
const MB_IN_BYTES = 1024 * 1024;
const NPM_REGISTRY_URL = 'https://registry.npmjs.org';

/**
 * Cost information for a single package
 * @interface PackageCostInfo
 */
interface PackageCostInfo {
    /** Cost without dependencies (only present when dependency=true) */
    standaloneCost?: number;
    /** Total cost including dependencies (always present) */
    totalCost: number;
}

/** Map of package IDs to their cost information */
type PackageCost = Record<string, PackageCostInfo>;

/**
 * @class PackageCostService
 * Service class for calculating package costs and dependencies
 * Handles size calculations, dependency resolution, and caching
 */
export class PackageCostService {
    /**
     * Calculate total cost for a package and optionally its dependencies
     * @param id - Package ID to calculate cost for
     * @param includeDependencies - Whether to include dependency costs
     * @returns Object containing costs for package and dependencies
     * @throws ApiError if package not found or calculation fails
     */
    static async calculatePackageCost(id: string, includeDependencies: boolean = false): Promise<PackageCost> {
        try {
            if (!id) {
                throw new ApiError('Package ID is required', 400);
            }

            console.log(`[PackageCostService] Calculating cost for package ${id}`);

            // Check cache first
            const cachedCost = await this.getCachedCost(id, includeDependencies);
            if (cachedCost) {
                console.log(`[PackageCostService] Using cached cost for ${id}`);
                return cachedCost;
            }

            // Get the package data to access both content size and package.json
            const packageData = await AppDataSource.getRepository(PackageData)
                .createQueryBuilder('data')
                .select(['data.contentSize', 'data.jsProgram', 'data.packageJson'])
                .where('data.packageId = :id', { id })
                .getOne();

            if (!packageData) {
                throw new ApiError('Package data not found', 404);
            }

            // Calculate base package cost using the stored content size
            const packageCost = await this.calculatePackageSize(packageData);
            console.log(`[PackageCostService] Base package cost: ${packageCost}MB`);

            if (!includeDependencies) {
                return { [id]: { totalCost: packageCost } };
            }

            // Calculate dependency costs using stored package.json
            const dependencyCosts = await this.calculateDependencyCosts(packageData);
            
            const totalCost = packageCost + Object.values(dependencyCosts)
                .reduce((sum, dep) => sum + dep.totalCost, 0);

            // Save to cache
            await this.savePackageCost(id, packageCost, totalCost, dependencyCosts);

            return {
                [id]: {
                    standaloneCost: packageCost,
                    totalCost: totalCost
                },
                ...dependencyCosts
            };

        } catch (error) {
            console.error('[PackageCostService] Failed to calculate cost:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Failed to calculate package cost', 500);
        }
    }

    /**
     * Get cached cost calculation if available
     * @private
     */
    private static async getCachedCost(id: string, includeDependencies: boolean): Promise<PackageCost | null> {
        try {
            const packageCostsRepo = AppDataSource.getRepository(PackageCosts);
            const existingCost = await packageCostsRepo.findOne({ where: { packageId: id }});

            if (!existingCost) return null;

            return includeDependencies ? {
                [id]: {
                    standaloneCost: existingCost.standaloneCost,
                    totalCost: existingCost.totalCost
                },
                ...existingCost.dependencyCosts
            } : {
                [id]: { totalCost: existingCost.totalCost }
            };

        } catch (error) {
            console.error('[PackageCostService] Cache lookup failed:', error);
            return null;
        }
    }

    /**
     * Save package cost to the database
     * @param id Package ID
     * @param standaloneCost Cost without dependencies
     * @param totalCost Total cost including dependencies
     * @param dependencyCosts Map of dependency costs
     * @returns Saved PackageCosts entity
     * @private
     */
    private static async savePackageCost(id: string, standaloneCost: number, totalCost: number, dependencyCosts: PackageCost): Promise<PackageCosts> {
        try {
            console.log('[PackageCostService] Saving new package cost entry');
            
            const packageCostsRepo = AppDataSource.getRepository(PackageCosts);

            // Create or update the cost record
            const cost = packageCostsRepo.create({
                packageId: id,
                standaloneCost: standaloneCost,
                totalCost: totalCost,
                dependencyCosts: Object.entries(dependencyCosts)
                    .filter(([key]) => key !== id)
                    .reduce((acc, [key, value]) => ({
                        ...acc,
                        [key]: value
                    }), {})
            });

            await packageCostsRepo.save(cost);
            return cost;

        } catch (error) {
            console.error('[PackageCostService] Failed to save package cost:', error);
            throw new ApiError('Failed to save package cost', 500);
        }
    }

    /**
     * Calculate total size of package contents in MB
     * @param data Package data containing content and JSProgram
     * @returns Size in MB
     * @throws ApiError if calculation fails
     * @private
     */
    private static async calculatePackageSize(data: PackageData): Promise<number> {
        try {
            if (!data) {
                throw new ApiError('Package data is required', 400);
            }

            console.log('[PackageCostService] Calculating package size');
            let totalSize = 0;

            // Use the stored content size instead of loading the content
            if (data.contentSize) {
                totalSize += data.contentSize / MB_IN_BYTES;
                console.log(`[PackageCostService] Content size: ${(data.contentSize / MB_IN_BYTES).toFixed(2)}MB`);
            }

            if (data.jsProgram) {
                const jsProgramSizeInBytes = Buffer.from(data.jsProgram).length;
                totalSize += jsProgramSizeInBytes / MB_IN_BYTES;
                console.log(`[PackageCostService] JSProgram size: ${(jsProgramSizeInBytes / MB_IN_BYTES).toFixed(2)}MB`);
            }

            const finalSize = Number(totalSize.toFixed(2));
            console.log(`[PackageCostService] Total package size: ${finalSize}MB`);
            return finalSize;

        } catch (error) {
            console.error('[PackageCostService] Failed to calculate package size:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Failed to calculate package size', 500);
        }
    }

    /**
     * Calculate costs for all package dependencies
     * @param data Package data containing dependencies
     * @returns Map of dependency IDs to their costs
     * @throws ApiError if calculation fails
     * @private
     */
    private static async calculateDependencyCosts(data: PackageData): Promise<PackageCost> {
        try {
            if (!data) {
                throw new ApiError('Package data is required', 400);
            }

            console.log('[PackageCostService] Calculating dependency costs');
            const dependencies = await this.getDependenciesFromPackage(data);
            const costs: PackageCost = {};

            for (const [depName, versionRange] of Object.entries(dependencies)) {
                console.log(`[PackageCostService] Processing dependency: ${depName}@${versionRange}`);
                try {
                    const depCost = await this.getDependencyCost(depName, versionRange);
                    if (depCost !== null) {
                        const depId = await this.getPackageId(depName, versionRange);
                        costs[depId] = {
                            standaloneCost: depCost,
                            totalCost: depCost
                        };
                        console.log(`[PackageCostService] Dependency ${depId} cost: ${depCost}MB`);
                    }
                } catch (error) {
                    console.error(`[PackageCostService] Failed to process dependency ${depName}:`, error);
                }
            }

            return costs;

        } catch (error) {
            console.error('[PackageCostService] Failed to calculate dependency costs:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Failed to calculate dependency costs', 500);
        }
    }

    /**
     * Extract dependencies from package.json
     * @param data Package data containing content
     * @returns Map of dependency names to version ranges
     * @private
     */
    private static async getDependenciesFromPackage(data: PackageData): Promise<Record<string, string>> {
        try {
            // Use the stored package.json instead of extracting from content
            const packageJson = data.packageJson;
            if (!packageJson) {
                console.log('[PackageCostService] No package.json found');
                return {};
            }

            console.log('[PackageCostService] Extracted dependencies:', packageJson.dependencies);
            return packageJson.dependencies || {};

        } catch (error) {
            console.error('[PackageCostService] Failed to extract dependencies:', error);
            return {};
        }
    }

    /**
     * Calculate cost for a single dependency
     * @param packageName Name of the dependency
     * @param versionRange Version range specification
     * @returns Size in MB or null if not found
     * @private
     */
    private static async getDependencyCost(packageName: string, versionRange: string): Promise<number | null> {
        try {
            if (!packageName || !versionRange) {
                throw new ApiError('Package name and version range required', 400);
            }

            // Try local registry first
            const localPackage = await this.findLocalPackage(packageName, versionRange);
            if (localPackage) {
                const data = await AppDataSource.getRepository(PackageData)
                    .findOne({ where: { packageId: localPackage.id } });
                if (data) {
                    return this.calculatePackageSize(data);
                }
            }

            // Fallback to npm registry
            return await this.getNpmPackageSize(packageName, versionRange);

        } catch (error) {
            console.error(`[PackageCostService] Failed to get dependency cost for ${packageName}:`, error);
            return null;
        }
    }

    /**
     * Get package size from npm registry
     * @param packageName Package name
     * @param versionRange Version range
     * @returns Size in MB or null if not found
     * @private
     */
    private static async getNpmPackageSize(packageName: string, versionRange: string): Promise<number | null> {
        try {
            const version = await this.resolveNpmVersion(packageName, versionRange);
            if (!version) return null;

            const response = await fetch(`${NPM_REGISTRY_URL}/${packageName}/${version}`);
            if (!response.ok) return null;

            const npmInfo = await response.json() as { dist?: { unpackedSize?: number } };
            if (!npmInfo.dist?.unpackedSize) return null;

            const sizeInMB = npmInfo.dist.unpackedSize / MB_IN_BYTES;
            return Number(sizeInMB.toFixed(2));

        } catch (error) {
            console.error(`[PackageCostService] Failed to get npm package size for ${packageName}:`, error);
            return null;
        }
    }

    /**
     * Find package in local registry matching version criteria
     * @param name Package name
     * @param versionRange Version range to match
     * @returns Matching package metadata or null
     * @private
     */
    private static async findLocalPackage(name: string, versionRange: string): Promise<PackageMetadata | null> {
        try {
            const packages = await AppDataSource.getRepository(PackageMetadata)
                .find({ where: { name } });

            return packages.find(pkg => semver.satisfies(pkg.version, versionRange)) || null;

        } catch (error) {
            console.error(`[PackageCostService] Failed to find local package ${name}:`, error);
            return null;
        }
    }

    /**
     * Resolve specific version from npm registry
     * @param packageName Package name
     * @param versionRange Version range to resolve
     * @returns Specific version or null if not found
     * @private
     */
    private static async resolveNpmVersion(packageName: string, versionRange: string): Promise<string | null> {
        try {
            const response = await fetch(`${NPM_REGISTRY_URL}/${packageName}`);
            if (!response.ok) return null;

            const info = await response.json() as { versions: Record<string, any> };
            return semver.maxSatisfying(Object.keys(info.versions), versionRange) || null;

        } catch (error) {
            console.error(`[PackageCostService] Failed to resolve npm version for ${packageName}:`, error);
            return null;
        }
    }

    /**
     * Get unique identifier for a package
     * @param packageName Package name
     * @param versionRange Version range
     * @returns Local package ID or npm-style identifier
     * @throws ApiError if ID cannot be generated
     * @private
     */
    private static async getPackageId(packageName: string, versionRange: string): Promise<string> {
        try {
            if (!packageName || !versionRange) {
                throw new ApiError('Package name and version range required', 400);
            }

            // Try local package first
            const localPackage = await this.findLocalPackage(packageName, versionRange);
            if (localPackage) {
                return localPackage.id;
            }

            // Fallback to npm-style ID
            const npmVersion = await this.resolveNpmVersion(packageName, versionRange);
            return `${packageName}@${npmVersion || versionRange}`;

        } catch (error) {
            console.error(`[PackageCostService] Failed to get package ID for ${packageName}:`, error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Failed to generate package ID', 500);
        }
    }
}