import { describe, it, expect, vi } from 'vitest';
import { getPackageJsonFromContentBuffer, extractNameAndVersionFromPackageJson, extractGithubAttributesFromGithubUrl, getNpmRepoUrlFromGithubUrl } from '../../src/utils/packageHelpers';
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
            expect(result).toEqual({ name: 'test-package', version: '1.0.0' });
        });

        it('should throw an error if name  is missing', () => {
            const packageJson = JSON.stringify({ version: '1.0.0' });

            expect(() => extractNameAndVersionFromPackageJson(packageJson)).toThrow(ApiError);
        });
    });

    describe('extractGithubAttributesFromGithubUrl', () => {
        it('should extract owner and repo from GitHub URL', () => {
            const url = 'https://github.com/owner/repo.git';

            const result = extractGithubAttributesFromGithubUrl(url);
            expect(result).toEqual({ owner: 'owner', repo: 'repo' });
        });

        it('should handle URLs without .git suffix', () => {
            const url = 'https://github.com/owner/repo';

            const result = extractGithubAttributesFromGithubUrl(url);
            expect(result).toEqual({ owner: 'owner', repo: 'repo' });
        });
    });
});