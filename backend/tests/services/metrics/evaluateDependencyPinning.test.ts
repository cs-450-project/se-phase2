import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';

// Mock octokit
vi.mock('../../../src/utils/octokit', () => ({
    default: {
        repos: {
            getContent: vi.fn(),
        },
    },
}));

// Mock logger
vi.mock('../../../src/utils/logger', () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}));

import { evaluateDependencyPinning } from '../../../src/services/metrics/evaluateDependencyPinning';
import octokit from '../../../src/utils/octokit';
import logger from '../../../src/utils/logger';

describe('evaluateDependencyPinning', () => {
    const octokitMock = octokit as unknown as {
        repos: {
            getContent: Mock;
        };
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return 0 for empty dependencies', async () => {
        const mockPackageJson = { dependencies: {} };
        octokitMock.repos.getContent.mockResolvedValueOnce({
            data: {
                content: Buffer.from(JSON.stringify(mockPackageJson)).toString('base64'),
                encoding: 'base64',
                type: 'file'
            }
        });

        const result = await evaluateDependencyPinning('owner', 'repo');
        expect(result).toBe(0);
    });

    it('should calculate correct score for mixed dependencies', async () => {
        const mockPackageJson = {
            dependencies: {
                "exact-version": "1.2.3",
                "caret-range": "^2.0.0",
                "pinned-version": "=3.4.5",
                "star-version": "*"
            }
        };

        octokitMock.repos.getContent.mockResolvedValueOnce({
            data: {
                content: Buffer.from(JSON.stringify(mockPackageJson)).toString('base64'),
                encoding: 'base64',
                type: 'file'
            }
        });

        const result = await evaluateDependencyPinning('owner', 'repo');
        expect(result).toBeCloseTo(0.5, 1); // 2 pinned out of 4 total
    });

    it('should handle unpinned dependencies correctly', async () => {
        const mockPackageJson = {
            dependencies: {
                "caret-dep": "^1.0.0",
                "tilde-dep": "~2.0.0",
                "star-dep": "*"
            }
        };

        octokitMock.repos.getContent.mockResolvedValueOnce({
            data: {
                content: Buffer.from(JSON.stringify(mockPackageJson)).toString('base64'),
                encoding: 'base64',
                type: 'file'
            }
        });

        const result = await evaluateDependencyPinning('owner', 'repo');
        expect(result).toBe(0);
    });

    it('should return 0 when package.json is not found', async () => {
        octokitMock.repos.getContent.mockRejectedValueOnce({
            status: 404,
            message: 'Not Found'
        });

        const result = await evaluateDependencyPinning('owner', 'repo');
        expect(result).toBe(0);
        expect(logger.error).toHaveBeenCalledWith(
            'Error evaluating dependency pinning: Not Found'
        );
    });

    it('should handle API errors gracefully', async () => {
        octokitMock.repos.getContent.mockRejectedValueOnce(
            new Error('API Error')
        );

        const result = await evaluateDependencyPinning('owner', 'repo');
        expect(result).toBe(0);
        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Error evaluating dependency pinning')
        );
    });
});