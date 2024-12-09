export function truncateResponse(result: any): string {
    try {
        // Deep clone and truncate long strings in object
        const truncated = JSON.parse(JSON.stringify(result, (key, value) => {
            if (typeof value === 'string' && value.length > 100) {
                return value.substring(0, 100) + '... [truncated]';
            }
            return value;
        }));

        // Convert truncated object to formatted JSON string
        return JSON.stringify(truncated, null, 2);

    } catch (error) {
        console.error('[PackageController] Error truncating response:', error);
        return '[Error truncating response]';
    }
}