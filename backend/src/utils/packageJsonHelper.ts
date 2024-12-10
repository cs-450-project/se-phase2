import { AppDataSource } from "../data-source.js";
import { PackageData } from "../entities/PackageData.js";
import { ApiError } from "./errors/ApiError.js";

export class PackageJsonHelper {
    
    static async getPackageJson(packageId: string): Promise<Record<string, any>> {
        const packageDataRepository = AppDataSource.getRepository(PackageData);
        const packageData = await packageDataRepository
            .createQueryBuilder('package_data')
            .select(['package_data.packageJson'])
            .where('package_data.packageId = :packageId', { packageId })
            .getOne();

        if (!packageData) {
            throw new ApiError(`Package with id ${packageId} not found`, 404);
        }

        return packageData.packageJson || {};
    }
    
    static async getDependencies(packageId: string): Promise<Record<string, string>> {
        const packageJson = await this.getPackageJson(packageId);
        return {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };
    }

    static async getScripts(packageId: string): Promise<Record<string, string>> {
        const packageJson = await this.getPackageJson(packageId);
        return packageJson.scripts || {};
    }

    static async getMainEntry(packageId: string): Promise<string | null> {
        const packageJson = await this.getPackageJson(packageId);
        return packageJson.main || null;
    }
}