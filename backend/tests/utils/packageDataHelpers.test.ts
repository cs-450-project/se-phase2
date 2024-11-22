import { describe, it, expect, vi } from 'vitest';
import { getPackageJsonFromContentBuffer, extractNameAndVersionFromPackageJson, extractGitHubAttributesFromGitHubURL, getNpmRepoURLFromGitHubURL } from '../../src/utils/packageDataHelpers';
import { ApiError } from '../../src/utils/errors/ApiError';
import AdmZip from 'adm-zip';

describe('packageDataHelpers', () => {
    describe('getPackageJsonFromContentBuffer', () => {
        it('should extract package.json content from base64 encoded zip buffer', () => {
            const packageJsonContent = JSON.stringify({ name: 'test-package', version: '1.0.0' });
            const zip = new AdmZip();
            zip.addFile('package.json', Buffer.from(packageJsonContent, 'utf8'));
            const zipBuffer = zip.toBuffer();
            const base64Zip = zipBuffer.toString('base64');

            const result = getPackageJsonFromContentBuffer(base64Zip);
            expect(result).toBe(packageJsonContent);
        });

        it('should throw an error if package.json is not found', () => {
            const zip = new AdmZip();
            const zipBuffer = zip.toBuffer();
            const base64Zip = zipBuffer.toString('base64');

            expect(() => getPackageJsonFromContentBuffer(base64Zip)).toThrow(ApiError);
        });
    });

    describe('extractNameAndVersionFromPackageJson', () => {
        it('should extract name and version from package.json', () => {
            const packageJson = JSON.stringify({ name: 'test-package', version: '1.0.0' });

            const result = extractNameAndVersionFromPackageJson(packageJson);
            expect(result).toEqual({ Name: 'test-package', Version: '1.0.0' });
        });

        it('should throw an error if name or version is missing', () => {
            const packageJson = JSON.stringify({ name: 'test-package' });

            expect(() => extractNameAndVersionFromPackageJson(packageJson)).toThrow(ApiError);
        });
    });

    describe('extractGitHubAttributesFromGitHubURL', () => {
        it('should extract owner and repo from GitHub URL', () => {
            const url = 'https://github.com/owner/repo.git';

            const result = extractGitHubAttributesFromGitHubURL(url);
            expect(result).toEqual({ owner: 'owner', repo: 'repo' });
        });

        it('should handle URLs without .git suffix', () => {
            const url = 'https://github.com/owner/repo';

            const result = extractGitHubAttributesFromGitHubURL(url);
            expect(result).toEqual({ owner: 'owner', repo: 'repo' });
        });
    });

    describe('getNpmRepoURLFromGitHubURL', () => {
        it('should fetch repository URL from npm API', async () => {
            const url = 'https://www.npmjs.com/package/test-package';
            const mockResponse = {
                repository: {
                    url: 'https://github.com/owner/repo.git'
                }
            };

            global.fetch = vi.fn().mockResolvedValue({
                json: vi.fn().mockResolvedValue(mockResponse)
            });

            const result = await getNpmRepoURLFromGitHubURL(url);
            expect(result).toBe('https://github.com/owner/repo.git');
        });

        it('should throw an error if repository URL is not found', async () => {
            const url = 'https://www.npmjs.com/package/test-package';
            const mockResponse = {};

            global.fetch = vi.fn().mockResolvedValue({
                json: vi.fn().mockResolvedValue(mockResponse)
            });

            await expect(getNpmRepoURLFromGitHubURL(url)).rejects.toThrow(ApiError);
        });
    });
});