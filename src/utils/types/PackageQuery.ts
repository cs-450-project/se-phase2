/**
 * @interface PackageQuery
 * Used for querying the package registry at the /packages endpoint.
 */


export interface PackageQuery {
    Version: string;
    Name: string;
}