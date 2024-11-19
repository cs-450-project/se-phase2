/**
 * @file PackageGetterService.ts
 * Service contains the business logic for getting a package from the database.
 * 
 */

import { Like } from 'typeorm';
import semver from 'semver';
import { ApiError } from "../utils/errors/ApiError.js";
import { AppDataSource } from "../data-source.js";
import { PackageMetadata } from "../entities/PackageMetadata.js";
import { PackageQuery } from "../utils/types/PackageQuery.js";

export class PackageGetterService {
  
  /**
   * @function queryPackages
   * Queries the database for packages based on the provided queries.
   * 
   * @param queries : PackageQuery[]
   * @returns results : Map<string, PackageMetadata[]>
   */
  static async queryPackages(queries: PackageQuery[]): Promise<PackageMetadata[]> {
      
      const packageMetadataRepository = await AppDataSource.getRepository(PackageMetadata);

      const results: PackageMetadata[] = [];
      // Iterate over each query and find the matching packages
      for (const query of queries) {

        // Check if the query is an asterisk, return all packages
        if (query.Name.includes("*")) {
          return packageMetadataRepository.find();
        }
        
        const namePackages = await this.findPackagesByName(
          query.Name
        );
        results.push(...namePackages);
        const versionPackages = await this.findPackagesByVersionRange(
          query.Version
        );
        results.push(...versionPackages);
      }

      return results;
  }  

    /**
     * @function findPackagesByName
     * @param name : string
     * @returns array with matching packages : Promise<PackageMetadata[]>
     */
    private static async findPackagesByName(
      name: string
    ): Promise<PackageMetadata[]> {

      const packageMetadataRepository = await AppDataSource.getRepository(PackageMetadata);

      // Find all packages that contain the name
      return packageMetadataRepository.find({
        where: { name: Like(`%${name}%`) },
      });

    }

    /**
     * @function parseVersionQuery
     * 
     * @param versionQuery : string
     * @returns object with type and value
     */
    private static parseVersionQuery(versionQuery: string): {
      type: 'exact' | 'range' | 'caret' | 'tilde';
      value: string; 
      } {

        // Check if versionQuery is empty
        if (!versionQuery) {
          throw new ApiError('No version query provided.', 400);
        }

        // Trim the version query
        const trimmedQuery = versionQuery.trim();

        // Check the first character of the version query to determine the type
        if (versionQuery.startsWith('^')) {
          return { type: 'caret', value: trimmedQuery };
        } else if (versionQuery.startsWith('~')) {
          return { type: 'tilde', value: trimmedQuery };
        } else if (versionQuery.includes(' ')) {
          return { type: 'range', value: trimmedQuery };
        } else {
          return { type: 'exact', value: trimmedQuery };
        };

    }


    /**
     * @function findPackagesByVersionRange
     * @param versionQuery 
     * @returns Array of matching packages: Promise<PackageMetadata[]>
     */ 
    private static async findPackagesByVersionRange(
      versionQuery: string
    ): Promise<PackageMetadata[]> {
      
      const packageMetadataRepository = await AppDataSource.getRepository(PackageMetadata);
      
      // Get all packages and sort by version
      const allPackages = await packageMetadataRepository.find({
        order: { version: 'DESC'},
      });

      // Parse the version query to determine semver type and value
      const parsedVersionQuery = this.parseVersionQuery(versionQuery);

      // Filter the packages based on the version query
      return allPackages.filter(pkg => {
        switch (parsedVersionQuery.type) {

          case 'exact':
            return semver.eq(pkg.version, parsedVersionQuery.value);

          case 'range': {
            const [min, max] = parsedVersionQuery.value.split(' ');
            return semver.gte(pkg.version, min) && semver.lte(pkg.version, max);
          }

          case 'caret':
            return semver.satisfies(pkg.version, parsedVersionQuery.value);

          case 'tilde':
            return semver.satisfies(pkg.version, parsedVersionQuery.value);
          
          default:
            return false;
        };

      });
    } 
}