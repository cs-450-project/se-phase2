import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluateCorrectness } from '../../../src/services/metrics/evaluateCorrectness';
import octokit from '../../../src/utils/octokit';

vi.mock('../../../src/utils/logger');
vi.mock('../../../src/utils/octokit', () => ({
    default: {
        repos: {
            getReadme: vi.fn(),
            getContent: vi.fn(),
            listContributors: vi.fn()
        }
    }
}));

describe('evaluateCorrectness', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return correct score when all checks pass', async () => {
        // Mock successful responses
        vi.mocked(octokit.repos.listContributors).mockResolvedValueOnce({
            data: new Array(10) // 10 contributors
        } as any);

        vi.mocked(octokit.repos.getContent).mockResolvedValueOnce({
            data: {
                content: Buffer.from(JSON.stringify({
                    scripts: { test: 'test command' }
                })).toString('base64')
            }
        } as any);

        const score = await evaluateCorrectness('owner', 'repo', true);
        expect(score).toBeCloseTo(0.75); // 0.05 (contributors) + 0.2 (readme) + 0.5 (tests)
    });

    it('should handle missing README', async () => {
        vi.mocked(octokit.repos.listContributors).mockResolvedValueOnce({
            data: new Array(10)
        } as any);

        vi.mocked(octokit.repos.getContent).mockResolvedValueOnce({
            data: {
                content: Buffer.from(JSON.stringify({
                    scripts: { test: 'test command' }
                })).toString('base64')
            }
        } as any);

        const score = await evaluateCorrectness('owner', 'repo', false);
        expect(score).toBeCloseTo(0.55); // 0.05 (contributors) + 0.5 (tests)
    });

    it('should handle missing tests', async () => {
        vi.mocked(octokit.repos.listContributors).mockResolvedValueOnce({
            data: new Array(10)
        } as any);

        vi.mocked(octokit.repos.getContent).mockRejectedValueOnce({ status: 404 });

        const score = await evaluateCorrectness('owner', 'repo', true);
        expect(score).toBeCloseTo(0.25); // 0.05 (contributors) + 0.2 (readme)
    });

    it('should handle no contributors', async () => {
        vi.mocked(octokit.repos.listContributors).mockRejectedValueOnce(new Error());
        
        vi.mocked(octokit.repos.getReadme).mockResolvedValueOnce({
            data: { content: 'readme content' }
        } as any);

        vi.mocked(octokit.repos.getContent).mockResolvedValueOnce({
            data: {
                content: Buffer.from(JSON.stringify({
                    scripts: { test: 'test command' }
                })).toString('base64')
            }
        } as any);

        const score = await evaluateCorrectness('owner', 'repo', true);
        expect(score).toBeCloseTo(0.7); // 0.2 (readme) + 0.5 (tests)
    });
});