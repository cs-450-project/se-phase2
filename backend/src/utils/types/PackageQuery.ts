/**
 * Used for querying the package registry at the /packages endpoint.
 */
export interface PackageQuery {
    /** Package name. Required. The name "*" is reserved for getting all packages */
    Name: string;
    /** Optional. Can be exact version (1.2.3), bounded range (1.2.3-2.1.0), caret (^1.2.3), or tilde (~1.2.0) */
    Version?: string;
}