import { AppDataSource } from "../data-source.js";
import { PackageMetadata } from "../entities/PackageMetadata.js";
import { PackageData } from "../entities/PackageData.js";
import { PackageCosts } from "../entities/PackageCosts.js";
import { ApiError } from "../utils/errors/ApiError.js";
import { getPackageJsonFromContentBuffer } from "../utils/packageHelpers.js";
import { fetch } from 'undici';
import * as semver from 'semver';

interface PackageCostInfo {
    standaloneCost?: number;  // Only present when dependency=true
    totalCost: number;        // Always present
}

type PackageCost = Record<string, PackageCostInfo>;

export class PackageCostService {
    private static readonly NPM_REGISTRY_URL = 'https://registry.npmjs.org';

    static async calculatePackageCost(id: string, includeDependencies: boolean = false) {
        try {

            const packageCostsRepo = AppDataSource.getRepository(PackageCosts);
            // Then in calculatePackageCost
            const existingCost = await packageCostsRepo.findOne({ where: { packageId: id }});
            if (existingCost && !includeDependencies) {
                return {
                    [id]: {
                        totalCost: existingCost.totalCost
                    }
                };
            }
            if (existingCost && includeDependencies) {
                return {
                    [id]: {
                        standaloneCost: existingCost.standaloneCost,
                        totalCost: existingCost.totalCost
                    },
                    ...existingCost.dependencyCosts
                };
            }


            console.log(`[PackageCostService] Calculating cost for package ${id}, includeDependencies: ${includeDependencies}`);

            if (!id) {
                throw new ApiError('Package ID is required', 400);
            }

            const packageMetadataRepo = AppDataSource.getRepository(PackageMetadata);
            const packageDataRepo = AppDataSource.getRepository(PackageData);

            const pkg = await packageMetadataRepo.findOne({ where: { id } });
            if (!pkg) {
                console.error(`[PackageCostService] Package not found with ID: ${id}`);
                throw new ApiError('Package not found', 404);
            }

            const data = await packageDataRepo.findOne({ where: { packageId: id } });
            if (!data) {
                console.error(`[PackageCostService] Package data not found for ID: ${id}`);
                throw new ApiError('Package data not found', 404);
            }

            const packageCost = await this.calculatePackageSize(data);
            console.log(`[PackageCostService] Base package cost: ${packageCost}MB`);

            if (!includeDependencies) {
                return { [id]: { totalCost: packageCost } };
            }

            console.log('[PackageCostService] Calculating dependency costs...');
            const dependencyCosts = await this.calculateDependencyCosts(data);
            const totalDependencyCost = Object.values(dependencyCosts)
                .reduce((sum, dep) => sum + dep.totalCost, 0);

            console.log(`[PackageCostService] Total dependency cost: ${totalDependencyCost}MB`);
            console.log(`[PackageCostService] Total package cost: ${packageCost + totalDependencyCost}MB`);

            const cost = await this.savePackageCost(id, packageCost, packageCost + totalDependencyCost, dependencyCosts);

            if (!cost) {
                throw new ApiError('Failed to save package cost', 500);
            }

            if (cost && !includeDependencies) {
                return {
                    [id]: {
                        totalCost: cost.totalCost
                    }
                };
            }
            if (cost && includeDependencies) {
                return {
                    [id]: {
                        standaloneCost: cost.standaloneCost,
                        totalCost: cost.totalCost
                    },
                    ...cost.dependencyCosts
                };
            }

        } catch (error) {
            console.error('[PackageCostService] Failed to calculate cost:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Failed to calculate package cost', 500);
        }
    }

    private static async savePackageCost(id: string, standaloneCost: number, totalCost: number, dependecyCosts: PackageCost): Promise<PackageCosts> {
        console.log('[PackageCostService] Saving new package cost entry');
        
        const packageCostsRepo = AppDataSource.getRepository(PackageCosts);

        // Create or update the cost record
        const cost = packageCostsRepo.create({
            packageId: id,
            standaloneCost: standaloneCost,
            totalCost: totalCost,
            dependencyCosts: Object.entries(dependecyCosts)
                .filter(([key]) => key !== id)
                .reduce((acc, [key, value]) => ({
                    ...acc,
                    [key]: value
                }), {})
        });

        await packageCostsRepo.save(cost);
        return cost;
    }

    private static async calculatePackageSize(data: PackageData): Promise<number> {
        try {
            console.log('[PackageCostService] Calculating package size');
            let totalSize = 0;

            if (data.content) {
                const contentSizeInBytes = Buffer.from(data.content, 'base64').length;
                totalSize += contentSizeInBytes / (1024 * 1024);
                console.log(`[PackageCostService] Content size: ${(contentSizeInBytes / (1024 * 1024)).toFixed(2)}MB`);
            }

            if (data.jsProgram) {
                const jsProgramSizeInBytes = Buffer.from(data.jsProgram).length;
                totalSize += jsProgramSizeInBytes / (1024 * 1024);
                console.log(`[PackageCostService] JSProgram size: ${(jsProgramSizeInBytes / (1024 * 1024)).toFixed(2)}MB`);
            }

            const finalSize = Number(totalSize.toFixed(2));
            console.log(`[PackageCostService] Total package size: ${finalSize}MB`);
            return finalSize;

        } catch (error) {
            console.error('[PackageCostService] Failed to calculate package size:', error);
            throw new ApiError('Failed to calculate package size', 500);
        }
    }

    private static async calculateDependencyCosts(data: PackageData): Promise<PackageCost> {
        try {
            console.log('[PackageCostService] Calculating dependency costs');
            const dependencies = await this.getDependenciesFromPackage(data);
            console.log(dependencies);
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
                    console.error(`[PackageCostService] Failed to calculate cost for ${depName}:`, error);
                }
            }

            return costs;

        } catch (error) {
            console.error('[PackageCostService] Failed to calculate dependency costs:', error);
            throw new ApiError('Failed to calculate dependency costs', 500);
        }
    }

    /**
     * Extract dependencies from package.json
     */
    private static async getDependenciesFromPackage(data: PackageData): Promise<Record<string, string>> {
        if (!data.content) {
            console.log('No content found');
            return {};
        }

        try {

            const packageJsonContent = await getPackageJsonFromContentBuffer(data.content);
            const packageJson = JSON.parse(packageJsonContent);

            console.log('Extracted dependencies:', packageJson.dependencies);

            return packageJson.dependencies || {};

        } catch (error) {
            console.error('Error extracting dependencies:', error);
            return {};
        }
    }

    /**
     * Get cost for a single dependency
     */
    private static async getDependencyCost(packageName: string, versionRange: string): Promise<number | null> {
        // First try local registry
        const localPackage = await this.findLocalPackage(packageName, versionRange);
        if (localPackage) {
            const data = await AppDataSource.getRepository(PackageData)
                .findOne({ where: { packageId: localPackage.id } });
            if (data) {
                return this.calculatePackageSize(data);
            }
        }

        // Fallback to npm registry
        try {
            const version = await this.resolveNpmVersion(packageName, versionRange);
            if (!version) return null;

            const response = await fetch(`${this.NPM_REGISTRY_URL}/${packageName}/${version}`);
            if (!response.ok) return null;

            const npmInfo = await response.json() as { dist?: { unpackedSize?: number } };
            
            const sizeInMB = (npmInfo.dist?.unpackedSize || 0) / (1024 * 1024);
            return Number(sizeInMB.toFixed(2));

        } catch (error) {
            console.error(`Error getting npm package size for ${packageName}:`, error);
            return null;
        }
    }

    /**
     * Find package in local registry
     */
    private static async findLocalPackage(name: string, versionRange: string): Promise<PackageMetadata | null> {
        const packages = await AppDataSource.getRepository(PackageMetadata)
            .find({ where: { name } });

        return packages.find(pkg => semver.satisfies(pkg.version, versionRange)) || null;
    }

    /**
     * Resolve npm version from version range
     */
    private static async resolveNpmVersion(packageName: string, versionRange: string): Promise<string | null> {
        try {
            const response = await fetch(`${this.NPM_REGISTRY_URL}/${packageName}`);
            if (!response.ok) return null;

            const info = await response.json() as { versions: Record<string, any> };
            return semver.maxSatisfying(Object.keys(info.versions), versionRange) || null;

        } catch (error) {
            console.error(`Error resolving npm version for ${packageName}:`, error);
            return null;
        }
    }

    /**
     * Get package ID (either local ID or npm-style ID)
     */
    private static async getPackageId(packageName: string, versionRange: string): Promise<string> {
        const localPackage = await this.findLocalPackage(packageName, versionRange);
        if (localPackage) {
            return localPackage.id;
        }

        const npmVersion = await this.resolveNpmVersion(packageName, versionRange);
        return `${packageName}@${npmVersion || versionRange}`;
    }
}