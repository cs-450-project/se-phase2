import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluateMetrics } from '../../../src/services/evaluators/evaluateMetrics.js';
import { ApiError } from '../../../src/utils/errors/ApiError.js';
import { Ranker } from '../../../src/services/scores/Ranker.js';
import logger from '../../../src/utils/logger.js';
import octokit from '../../../src/utils/octokit';
import { evaluateBusFactor } from '../../../src/services/metrics/evaluateBusFactor.js';
import { evaluateCorrectness } from '../../../src/services/metrics/evaluateCorrectness.js';
import { evaluateLicense } from '../../../src/services/metrics/evaluateLicense.js';
import { evaluateRampUp } from '../../../src/services/metrics/evaluateRampUp.js';
import { evaluateResponsiveMaintainers } from '../../../src/services/metrics/evaluateResponsiveMaintainers.js';
import { evaluateDependencyPinning } from '../../../src/services/metrics/evaluateDependencyPinning.js';
import { evaluateCodeReview } from '../../../src/services/metrics/evaluateCodeReview.js';

// Mock all dependent modules
vi.mock('../../../src/utils/logger.js');
vi.mock('../../../src/services/metrics/evaluateBusFactor.js');
vi.mock('../../../src/services/metrics/evaluateCorrectness.js');
vi.mock('../../../src/services/metrics/evaluateLicense.js'); 
vi.mock('../../../src/services/metrics/evaluateRampUp.js');
vi.mock('../../../src/services/metrics/evaluateResponsiveMaintainers.js');
vi.mock('../../../src/services/metrics/evaluateDependencyPinning.js');
vi.mock('../../../src/services/metrics/evaluateCodeReview.js');

vi.mock('../../../src/utils/octokit', () => ({
    default: {
        repos: {
            getReadme: vi.fn()
        }
    }
}));

describe('evaluateMetrics', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(evaluateBusFactor).mockResolvedValue(1);
        vi.mocked(evaluateCorrectness).mockResolvedValue(1);
        vi.mocked(evaluateLicense).mockResolvedValue(1);
        vi.mocked(evaluateRampUp).mockResolvedValue(1);
        vi.mocked(evaluateResponsiveMaintainers).mockResolvedValue(1);
        vi.mocked(evaluateDependencyPinning).mockResolvedValue(1);
        vi.mocked(evaluateCodeReview).mockResolvedValue(1);
    });

    it('should throw ApiError if owner is missing', async () => {
        await expect(evaluateMetrics('', 'repo')).rejects.toThrow(ApiError);
    });

    it('should throw ApiError if repo is missing', async () => {
        await expect(evaluateMetrics('owner', '')).rejects.toThrow(ApiError);
    });

    it('should return a Ranker instance with all metrics evaluated', async () => {
        const { ranker: result, readmeContent } = await evaluateMetrics('owner', 'repo');
        expect(result).toBeInstanceOf(Ranker);
        expect(result.netScore).toBeDefined();
        expect(result.netScoreLatency).toBeDefined();
    });

    it('should handle metric evaluation failures gracefully', async () => {
        vi.mocked(evaluateBusFactor).mockImplementation(() => Promise.reject(new Error()));
        
        const { ranker: result, readmeContent } = await evaluateMetrics('owner', 'repo');
        expect(result.busFactor).toBe(0);
        expect(logger.error).toHaveBeenCalled();
    });

    it('should calculate and set latencies for all metrics', async () => {
        
        vi.mocked(octokit.repos.getReadme).mockResolvedValueOnce({
            data: { content: 'readme content' }
        } as any);

        const { ranker: result, readmeContent } = await evaluateMetrics('owner', 'repo');
        
        expect(result.busFactorLatency).toBeGreaterThanOrEqual(0);
        expect(result.correctnessLatency).toBeGreaterThanOrEqual(0);
        expect(result.licenseLatency).toBeGreaterThanOrEqual(0);
        expect(result.rampUpLatency).toBeGreaterThanOrEqual(0);
        expect(result.responsiveMaintainersLatency).toBeGreaterThanOrEqual(0);
        expect(result.dependencyPinningLatency).toBeGreaterThanOrEqual(0);
        expect(result.codeReviewLatency).toBeGreaterThanOrEqual(0);
        expect(result.netScoreLatency).toBeGreaterThanOrEqual(0);
    });
});