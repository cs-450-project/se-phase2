import { describe, it, expect, vi } from 'vitest';
import { getPackageJsonFromContentBuffer, extractNameAndVersionFromPackageJson, extractGithubAttributesFromGithubUrl, getNpmRepoUrlFromGithubUrl } from '../../src/utils/packageHelpers';
import { ApiError } from '../../src/utils/errors/ApiError';
import AdmZip from 'adm-zip';

describe('packageHelpers', () => {
    describe('getPackageJsonFromContentBuffer', () => {
        it('should extract package.json content from base64 encoded zip buffer', async () => {
            // Create test package.json
            const packageJsonContent = JSON.stringify({ 
                name: 'test-package', 
                version: '1.0.0' 
            });

            // Create zip with package.json
            const zip = new AdmZip();
            zip.addFile('package.json', Buffer.from(packageJsonContent, 'utf8'));
            const base64Zip = zip.toBuffer().toString('base64');

            // Test extraction
            const result = await getPackageJsonFromContentBuffer(base64Zip);
            expect(result).toBe(packageJsonContent);
        });

        it('should throw an error if package.json is not found', async () => {
            const zip = new AdmZip();
            const base64Zip = zip.toBuffer().toString('base64');

            await expect(getPackageJsonFromContentBuffer(base64Zip))
                .rejects
                .toThrow(ApiError);
        });

        it('should throw an error if content buffer is empty', async () => {
            await expect(getPackageJsonFromContentBuffer(''))
                .rejects
                .toThrow(ApiError);
        });
    });

    describe('extractNameAndVersionFromPackageJson', () => {
        it('should extract name and version from package.json', () => {
            const packageJson = JSON.stringify({ 
                name: 'test-package', 
                version: '1.0.0' 
            });

            const result = extractNameAndVersionFromPackageJson(packageJson);
            expect(result).toEqual({ 
                packageJsonName: 'test-package', 
                packageJsonVersion: '1.0.0' 
            });
        });

        it('should return null name if name is missing', () => {
            const packageJson = JSON.stringify({ 
                version: '1.0.0' 
            });

            const result = extractNameAndVersionFromPackageJson(packageJson);
            expect(result).toEqual({ 
                packageJsonName: null, 
                packageJsonVersion: '1.0.0' 
            });
        });

        it('should return null version if version is missing', () => {
            const packageJson = JSON.stringify({ 
                name: 'test-package' 
            });

            const result = extractNameAndVersionFromPackageJson(packageJson);
            expect(result).toEqual({ 
                packageJsonName: 'test-package', 
                packageJsonVersion: null 
            });
        });

        it('should throw error if package.json is empty', () => {
            expect(() => extractNameAndVersionFromPackageJson('')).toThrow(ApiError);
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