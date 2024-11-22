import { describe, it, expect, vi, Mock, beforeEach, afterEach } from 'vitest';

// Mock cache with TTL checking
const mockCache = new Map();
const CACHE_TTL = 3600000;

// Mock octokit
vi.mock('../../../src/utils/octokit', () => ({
    default: {
        pulls: {
            list: vi.fn(),
            listReviews: vi.fn(),
        },
    },
}));

// Mock logger
vi.mock('../../../src/utils/logger', () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    },
}));

import { evaluateCodeReview } from '../../../src/services/metrics/evaluateCodeReview';
import octokit from '../../../src/utils/octokit';
import logger from '../../../src/utils/logger';

describe('evaluateCodeReview', () => {
    const owner = 'testOwner';
    const repo = 'testRepo';

    const octokitMock = octokit as unknown as {
        pulls: {
            list: Mock;
            listReviews: Mock;
        };
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockCache.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return 1.0 if no pull requests exist', async () => {
        octokitMock.pulls.list.mockResolvedValueOnce({
            data: []
        });

        const result = await evaluateCodeReview(owner, repo);
        expect(result).toBe(1.0);
        expect(octokitMock.pulls.list).toHaveBeenCalledWith({
            owner,
            repo,
            state: 'closed',
            per_page: 10,
            page: 1
        });
    });

    it('should calculate correct review score when some PRs have reviews', async () => {
        // Setup PRs with different review statuses
        octokitMock.pulls.list.mockResolvedValueOnce({
            data: [
                { number: 1 },
                { number: 2 },
                { number: 3 }
            ]
        });

        // Mock reviews for each PR
        octokitMock.pulls.listReviews
            .mockResolvedValueOnce({ data: [] })              // PR #1 no review
            .mockResolvedValueOnce({ data: [{ id: 1 }] })    // PR #2 has review
            .mockResolvedValueOnce({ data: [{ id: 2 }] });   // PR #3 has review

        const result = await evaluateCodeReview(owner, repo);
        // 2 out of 3 PRs have reviews = 0.667
        expect(result).toBeCloseTo(1, 3);
    });

    it('should use cached results when available', async () => {
        const cacheKey = `${owner}/${repo}/reviews`;
        mockCache.set(cacheKey, {
            data: 1.0,
            timestamp: Date.now()
        });

        const result = await evaluateCodeReview(owner, repo);
        expect(result).toBe(1.0);
        expect(octokitMock.pulls.list).not.toHaveBeenCalled();
    });

    it('should handle cache expiration', async () => {
        vi.useFakeTimers();
        const cacheKey = `${owner}/${repo}/reviews`;

        // First call
        octokitMock.pulls.list.mockResolvedValueOnce({
            data: [{ number: 1 }]
        });
        octokitMock.pulls.listReviews.mockResolvedValueOnce({ 
            data: [{ id: 1 }] 
        });

        await evaluateCodeReview(owner, repo);

        // Advance time past cache TTL
        vi.advanceTimersByTime(CACHE_TTL + 1000);

        // Clear existing mock responses
        vi.clearAllMocks();

        // Setup new mocks for second call
        octokitMock.pulls.list.mockResolvedValueOnce({
            data: [{ number: 2 }]
        });
        octokitMock.pulls.listReviews.mockResolvedValueOnce({ 
            data: [{ id: 2 }] 
        });

        await evaluateCodeReview(owner, repo);
        expect(octokitMock.pulls.list).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
    });
});