/**
 * @file PackageGetterService.ts
 * Service contains the business logic for retrieving packages from the database.
 */

import { Like } from 'typeorm';
import semver from 'semver';
import { ApiError } from "../utils/errors/ApiError.js";
import { AppDataSource } from "../data-source.js";
import { PackageMetadata } from "../entities/PackageMetadata.js";
import { PackageData } from "../entities/PackageData.js";
import { PackageRating } from "../entities/PackageRating.js";
import { PackageQuery } from "../utils/types/PackageQuery.js";

export class PackageGetterService {

  static async queryPackages(queries: PackageQuery[]): Promise<PackageMetadata[]> {
    try {
      if (!queries || !Array.isArray(queries)) {
        throw new ApiError('Invalid queries: Expected array of package queries', 400);
      }

      console.log(`[PackageGetterService] Processing ${queries.length} package queries`);
      const packageMetadataRepository = AppDataSource.getRepository(PackageMetadata);
      const results: PackageMetadata[] = [];

      for (const query of queries) {
        if (!query.Name) {
          throw new ApiError('Package name is required', 400);
        }

        if (query.Name.includes("*")) {
          console.log('[PackageGetterService] Processing wildcard query - returning all packages');
          return packageMetadataRepository.find();
        }

        const namePackages = await this.findPackagesByName(query.Name);
        const versionPackages = await this.findPackagesByVersionRange(query.Version);

        results.push(...namePackages, ...versionPackages);
      }

      console.log(`[PackageGetterService] Found ${results.length} matching packages`);
      return results;

    } catch (error) {
      console.error('[PackageGetterService] Package query failed:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to query packages', 500);
    }
  }

  static async getPackageMetadataAndDataById(id: number) {
    try {
      if (!id) {
        throw new ApiError('Package ID is required', 400);
      }
      console.log(`[PackageGetterService] Fetching package with ID: ${id}`);

      // Fetch the package metadata from the database using the provided ID
      const packageMetadataRepository = AppDataSource.getRepository(PackageMetadata);
      const metadata = await packageMetadataRepository.findOne({
        where: { id: id },
      });

      if (!metadata) {
        throw new ApiError('Package does not exist', 404);
      }

      // Fetch the package data from the database using the package metadata
      const packageDataRepository = AppDataSource.getRepository(PackageData);
      const data = await packageDataRepository.findOne({
        where: { packageId: metadata.id },
      });

      if (!data) {
        throw new ApiError('Package data not found', 404);
      }

      console.log(`[PackageGetterService] Found package with ID: ${id}`);

      // Return the package metadata and data
      return { metadata, data };

    } catch (error) {
      console.error(`[PackageGetterService] Failed to find package by ID '${id}':`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to find package by ID', 500);
    }
  }

  static async getPackageRatingFromId(id: number) {
    try {
      if (!id) {
        throw new ApiError('Package ID is required', 400);
      }
      console.log(`[PackageGetterService] Fetching rating for package with ID: ${id}`);

      // Fetch the package metadata from the database using the provided ID
      const packageRatingRepository = AppDataSource.getRepository(PackageRating);
      const rating = await packageRatingRepository.findOne({
        where: { packageId: id },
      });

      if (!rating) {
        throw new ApiError('Package does not exist', 404);
      }

      console.log(`[PackageGetterService] Found package with ID: ${id}`);

      // Return the package rating
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
      }

    } catch (error) {
      console.error(`[PackageGetterService] Failed to find package by ID '${id}':`, error);
      if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to find package rating by ID', 400);
      
    }
  }

  private static async findPackagesByName(name: string): Promise<PackageMetadata[]> {
    try {
      if (!name) {
        throw new ApiError('Package name is required', 400);
      }

      console.log(`[PackageGetterService] Searching for packages matching name: ${name}`);
      const packageMetadataRepository = AppDataSource.getRepository(PackageMetadata);

      const packages = await packageMetadataRepository.find({
        where: { name: Like(`%${name}%`) },
      });

      console.log(`[PackageGetterService] Found ${packages.length} packages matching name: ${name}`);
      return packages;

    } catch (error) {
      console.error(`[PackageGetterService] Failed to find packages by name '${name}':`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to search packages by name', 500);
    }
  }

  private static parseVersionQuery(versionQuery: string): {
    type: 'exact' | 'range' | 'caret' | 'tilde';
    value: string;
  } {
    try {
      if (!versionQuery) {
        throw new ApiError('Version query is required', 400);
      }

      console.log(`[PackageGetterService] Parsing version query: ${versionQuery}`);
      const trimmedQuery = versionQuery.trim();

      if (trimmedQuery.startsWith('^')) {
        return { type: 'caret', value: trimmedQuery };
      } else if (trimmedQuery.startsWith('~')) {
        return { type: 'tilde', value: trimmedQuery };
      } else if (trimmedQuery.includes(' ')) {
        return { type: 'range', value: trimmedQuery };
      } else {
        return { type: 'exact', value: trimmedQuery };
      }

    } catch (error) {
      console.error(`[PackageGetterService] Failed to parse version query '${versionQuery}':`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Invalid version query format', 400);
    }
  }

  private static async findPackagesByVersionRange(versionQuery: string): Promise<PackageMetadata[]> {
    try {
      if (!versionQuery) {
        throw new ApiError('Version query is required', 400);
      }

      console.log(`[PackageGetterService] Searching for packages matching version: ${versionQuery}`);
      const packageMetadataRepository = AppDataSource.getRepository(PackageMetadata);

      const allPackages = await packageMetadataRepository.find({
        order: { version: 'DESC' },
      });

      const parsedVersionQuery = this.parseVersionQuery(versionQuery);

      const matchingPackages = allPackages.filter(pkg => {
        switch (parsedVersionQuery.type) {
          case 'exact':
            return semver.eq(pkg.version, parsedVersionQuery.value);
          case 'range': {
            const [min, max] = parsedVersionQuery.value.split(' ');
            return semver.gte(pkg.version, min) && semver.lte(pkg.version, max);
          }
          case 'caret':
          case 'tilde':
            return semver.satisfies(pkg.version, parsedVersionQuery.value);
          default:
            return false;
        }
      });

      console.log(`[PackageGetterService] Found ${matchingPackages.length} packages matching version: ${versionQuery}`);
      return matchingPackages;

    } catch (error) {
      console.error(`[PackageGetterService] Failed to find packages by version '${versionQuery}':`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to search packages by version', 500);
    }
  }
}
