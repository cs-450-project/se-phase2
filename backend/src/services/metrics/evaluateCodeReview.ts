import logger from '../../utils/logger.js';
import octokit from '../../utils/octokit.js';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000;
const MAX_RETRY_DELAY = 15000;
const CACHE_TTL = 3600000; // 1 hour
const cache = new Map();

export async function evaluateCodeReview(owner: string, repo: string): Promise<number> {
    logger.info(`Starting Code Review evaluation for ${owner}/${repo}`);
    const cacheKey = `${owner}/${repo}/reviews`;

    try {
        // Check cache
        if (cache.has(cacheKey)) {
            const { data, timestamp } = cache.get(cacheKey);
            if (Date.now() - timestamp < CACHE_TTL) {
                return data;
            }
        }

        const pullRequests = await getPullRequests(owner, repo);
        if (pullRequests.length === 0) {
            return cacheResult(cacheKey, 1.0);
        }

        let reviewedCount = 0;
        for (const pr of pullRequests) {
            await sleep(1000); // Rate limiting
            const hasReviews = await checkPRReviews(owner, repo, pr.number);
            if (hasReviews) reviewedCount++;
        }

        const score = reviewedCount / pullRequests.length;
        return cacheResult(cacheKey, score);

    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Failed to evaluate code review: ${error.message}`);
        } else {
            logger.error(`Failed to evaluate code review: ${String(error)}`);
        }
        return 0;
    }
}

async function getPullRequests(owner: string, repo: string): Promise<any[]> {
    try {
        const response = await fetchWithRetry(() => octokit.pulls.list({
            owner,
            repo,
            state: 'closed',
            per_page: 30
        }));
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Failed to fetch pull requests: ${error.message}`);
        } else {
            logger.error(`Failed to fetch pull requests: ${String(error)}`);
        }
        return [];
    }
}

async function checkPRReviews(owner: string, repo: string, pullNumber: number): Promise<boolean> {
    try {
        const response = await fetchWithRetry(() => octokit.pulls.listReviews({
            owner,
            repo,
            pull_number: pullNumber
        }));
        return response.data.length > 0;
    } catch (error) {
        if (error instanceof Error) {
            logger.warn(`Failed to check reviews for PR #${pullNumber}: ${error.message}`);
        } else {
            logger.warn(`Failed to check reviews for PR #${pullNumber}: ${String(error)}`);
        }
        return false;
    }
}

async function fetchWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            if (attempt > 0) {
                const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), MAX_RETRY_DELAY);
                await sleep(delay);
            }
            return await operation();
        } catch (error: any) {
            lastError = error;
            if (error.status === 403) {
                logger.warn(`Rate limit exceeded, waiting ${INITIAL_RETRY_DELAY * Math.pow(2, attempt)}ms before retry ${attempt + 1}/${MAX_RETRIES}`);
                if (attempt < MAX_RETRIES - 1) continue;
            }
            throw error;
        }
    }
    throw lastError;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function cacheResult(key: string, value: number): number {
    cache.set(key, {
        data: value,
        timestamp: Date.now()
    });
    return value;
}