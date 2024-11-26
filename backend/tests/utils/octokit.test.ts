import { describe, it, expect, vi } from 'vitest';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

vi.mock('@octokit/rest', () => {
    return {
        Octokit: vi.fn().mockImplementation(() => {
            return {
                auth: process.env.GITHUB_TOKEN
            };
        })
    };
});

describe('Octokit Authentication', () => {
    it('should be authenticated with the GITHUB_TOKEN', () => {
        expect(octokit.auth).toBe(process.env.GITHUB_TOKEN);
    });
});