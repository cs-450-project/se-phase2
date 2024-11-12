import { describe, it, expect, vi, Mock, beforeEach, afterEach } from 'vitest';

// Mock the octokit module
vi.mock('../../../src/utils/octokit', () => ({
    default: {
      repos: {
        listContributors: vi.fn(),
      },
    },
}));

// Mock the logger module
vi.mock('../../../src/utils/logger', () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}));

import { evaluateBusFactor } from '../../../src/services/metrics/evaluateBusFactor';
import octokit from '../../../src/utils/octokit';
import logger from '../../../src/utils/logger';

describe('evaluateBusFactor', () => {

    const octokitMock = octokit as unknown as {
        repos: {
            listContributors: Mock;
        }; 
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return 0 if no contributors are found', async () => {
        octokitMock.repos.listContributors.mockResolvedValueOnce({
            data: [],
        });

        const result = await evaluateBusFactor('owner', 'repo');
        expect(result).toBe(0);
    });

    it('should return 0 if top contributor percentage is >= 0.8', async () => {
        octokitMock.repos.listContributors.mockResolvedValueOnce({
            data: [
                { contributions: 80 },
                { contributions: 20 },
            ],
        });

        const result = await evaluateBusFactor('owner', 'repo');
        expect(result).toBe(0);
    });

    it('should return 0.2 if top contributor percentage is >= 0.6 and < 0.8', async () => {
        octokitMock.repos.listContributors.mockResolvedValue({
            data: [
                { contributions: 60 },
                { contributions: 20 },
                { contributions: 10 },
                { contributions: 10 },
            ],
        });

        const result = await evaluateBusFactor('owner', 'repo');
        expect(result).toBe(0.2);
    });

    it('should return 0.5 if top contributor percentage is >= 0.4 and < 0.6', async () => {
        octokitMock.repos.listContributors.mockResolvedValue({
            data: [
                { contributions: 50 },
                { contributions: 50 },
            ],
        });

        const result = await evaluateBusFactor('owner', 'repo');
        expect(result).toBe(0.5);
    });

    it('should return 1 if top contributor percentage is < 0.4', async () => {
        octokitMock.repos.listContributors.mockResolvedValue({
            data: [
                { contributions: 30 },
                { contributions: 70 },
            ],
        });

        const result = await evaluateBusFactor('owner', 'repo');
        expect(result).toBe(1);
    });

    it('should log an error and return 0 if an exception occurs', async () => {
        octokitMock.repos.listContributors.mockRejectedValue(new Error('API error'));

        const result = await evaluateBusFactor('owner', 'repo');
        expect(result).toBe(0);
        expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error evaluating Bus Factor for repository owner/repo: API error'));
    }); 
});