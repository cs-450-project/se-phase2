import logger from '../../utils/logger.js';
import octokit from '../../utils/octokit.js';
import semver from 'semver';

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000;
const MAX_RETRY_DELAY = 15000;
const CACHE_TTL = 3600000; // 1 hour
const cache = new Map();

export async function evaluateDependencyPinning(owner: string, repo: string): Promise<number> {
    logger.info(`Starting Dependency Pinning evaluation for ${owner}/${repo}`);
    const cacheKey = `${owner}/${repo}`;

    try {
        // Check cache first
        if (cache.has(cacheKey)) {
            const { data, timestamp } = cache.get(cacheKey);
            if (Date.now() - timestamp < CACHE_TTL) {
                return data;
            }
        }

        const response = await fetchWithRetry(async () => {
            return await octokit.repos.getContent({
                owner,
                repo,
                path: 'package.json',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
        });

        if (!response || !('content' in response.data)) {
            return handleEmptyResponse(cacheKey);
        }

        const score = calculateDependencyScore(response.data);
        
        // Cache the result
        cache.set(cacheKey, {
            data: score,
            timestamp: Date.now()
        });

        return score;
    } catch (error) {
        return handleError(error, owner, repo);
    }
}

async function fetchWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            if (attempt > 0) {
                const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), MAX_RETRY_DELAY);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            return await operation();
        } catch (error: any) {
            lastError = error;
            if (error.status === 403) {
                logger.warn(`Rate limit exceeded, attempt ${attempt + 1}/${MAX_RETRIES}`);
                if (attempt < MAX_RETRIES - 1) continue;
            }
            throw error;
        }
    }
    throw lastError;
}

function calculateDependencyScore(data: any): number {
    const content = Buffer.from(data.content, 'base64').toString();
    const packageJson = JSON.parse(content);
    const dependencies = packageJson.dependencies || {};
    
    if (Object.keys(dependencies).length === 0) {
        return 0;
    }

    const pinnedCount = Object.entries(dependencies)
        .filter(([_, version]) => 
            typeof version === 'string' && 
            semver.validRange(version as string) && 
            isPinnedVersion(version as string)
        ).length;

    return pinnedCount / Object.keys(dependencies).length;
}

function isPinnedVersion(version: string): boolean {
    return !version.startsWith('^') && 
           !version.startsWith('~') && 
           !version.includes('*') && 
           !version.includes('x');
}

function handleEmptyResponse(cacheKey: string): number {
    const score = 0;
    cache.set(cacheKey, {
        data: score,
        timestamp: Date.now()
    });
    return score;
}

function handleError(error: any, owner: string, repo: string): number {
    if (error instanceof Error) {
        logger.error(`Error evaluating dependency pinning for ${owner}/${repo}: ${error.message}`);
    } else {
        logger.error(`Error evaluating dependency pinning for ${owner}/${repo}: ${String(error)}`);
    }
    return 0;
}