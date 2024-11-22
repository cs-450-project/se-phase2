import logger from '../../utils/logger.js';
import octokit from '../../utils/octokit.js';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;
const CACHE_TTL = 3600000; // 1 hour
const MAX_PRS = 10; // Only check last 10 PRs
const cache = new Map();

export async function evaluateCodeReview(owner: string, repo: string): Promise<number> {
    const cacheKey = `${owner}/${repo}/reviews`;
    
    try {
        // Check cache
        if (cache.has(cacheKey)) {
            const { data, timestamp } = cache.get(cacheKey);
            if (Date.now() - timestamp < CACHE_TTL) return data;
        }

        // Fetch PRs with reduced count
        const response = await fetchWithRetry(() => octokit.pulls.list({
            owner,
            repo,
            state: 'closed',
            per_page: MAX_PRS,
            page: 1
        })).catch(error => {
            throw new Error('API Error');
        });

        if (!response.data.length) return cacheResult(cacheKey, 1.0);

        // Parallel review checks
        const reviewChecks = await Promise.all(
            response.data.map(pr => 
                checkPRReviews(owner, repo, pr.number)
                    .catch(() => false)
            )
        );

        const hasReviews = reviewChecks.some(Boolean);
        const score = hasReviews ? 1 : 0;
        return cacheResult(cacheKey, score);

    } catch (error) {
        logger.error(`Failed to evaluate code review: ${error instanceof Error ? error.message : String(error)}`);
        return 1;
    }
}

async function checkPRReviews(owner: string, repo: string, pullNumber: number): Promise<boolean> {
    const response = await fetchWithRetry(() => octokit.pulls.listReviews({
        owner,
        repo,
        pull_number: pullNumber
    }));
    return response.data.length > 0;
}

async function fetchWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            if (attempt > 0) await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return await operation();
        } catch (error: any) {
            if (error.status === 403 && attempt < MAX_RETRIES) {
                logger.warn(`Rate limit exceeded, retrying... (${attempt + 1}/${MAX_RETRIES})`);
                continue;
            }
            throw error;
        }
    }
    throw new Error('Max retries exceeded');
}

function cacheResult(key: string, value: number): number {
    cache.set(key, { data: value, timestamp: Date.now() });
    return value;
}