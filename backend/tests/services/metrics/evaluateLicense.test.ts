import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluateLicense } from '../../../src/services/metrics/evaluateLicense';
import octokit from '../../../src/utils/octokit';
import logger from '../../../src/utils/logger';
import { read } from 'fs';

vi.mock('../../../src/utils/octokit');
vi.mock('../../../src/utils/logger');

describe('evaluateLicense', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return score 1 for approved license from GitHub API', async () => {
        
        const readmeContent = `
            # Sample Project
            This is a sample README without the required sections.
        `;

        vi.mocked(octokit.repos.get).mockResolvedValueOnce({
            data: {
                license: { spdx_id: 'MIT' }
            }
        } as any);

        const score = await evaluateLicense('testOwner', 'testRepo', readmeContent);
        expect(score).toBe(1);
    });

    it('should return score 0 for unapproved license from GitHub API', async () => {
        
        const readmeContent = '';

        vi.mocked(octokit.repos.get).mockResolvedValueOnce({
            data: {
                license: { spdx_id: 'GPL-3.0' }
            }
        } as any);

        const score = await evaluateLicense('testOwner', 'testRepo', readmeContent);
        expect(score).toBe(0);
    });

    it('should check README when no license in GitHub API', async () => {
        vi.mocked(octokit.repos.get).mockResolvedValueOnce({
            data: { license: null }
        } as any);

        vi.mocked(octokit.repos.getReadme).mockResolvedValueOnce({
            data: {
                content: Buffer.from('This project uses the MIT License').toString('base64')
            }
        } as any);

        const readmeContent = 'This project uses the MIT License';

        const score = await evaluateLicense('testOwner', 'testRepo', readmeContent);
        expect(score).toBe(1);
    });

    it('should return score 0 when no license found', async () => {
        
        const readmeContent = '';
        
        vi.mocked(octokit.repos.get).mockResolvedValueOnce({
            data: { license: null }
        } as any);

        vi.mocked(octokit.repos.getReadme).mockResolvedValueOnce({
            data: {
                content: Buffer.from('No license information').toString('base64')
            }
        } as any);

        const score = await evaluateLicense('testOwner', 'testRepo', readmeContent);
        expect(score).toBe(0);
    });

    it('should handle API errors gracefully', async () => {
        const readmeContent = '';
        
        vi.mocked(octokit.repos.get).mockRejectedValueOnce(new Error('API Error'));

        const score = await evaluateLicense('testOwner', 'testRepo', readmeContent);
        expect(score).toBe(0);
        expect(logger.error).toHaveBeenCalled();
    });
});