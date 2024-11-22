import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { getPackageJsonFromContentBuffer, extractNameAndVersionFromPackageJson, extractGitHubAttributesFromGitHubURL } from '../../../../src/utils/packageDataHelpers';
import { PackageUploadService } from '../../src/services/PackageUploadService';
import { AppDataSource } from '../../src/data-source';
import { ApiError } from '../../src/utils/errors/ApiError';
import axios from 'axios';
import octokit from '../../src/utils/octokit';


// Mock external dependencies
vi.mock('../../src/data-source');
vi.mock('../../src/utils/octokit');
vi.mock('axios');

// Mock helper functions with proper implementations
vi.mock('../../src/utils/packageDataHelpers', () => ({
  getPackageJsonFromContentBuffer: vi.fn().mockResolvedValue(
    'mocked-package-json'
  ),
  extractNameAndVersionFromPackageJson: vi.fn().mockReturnValue({
    Name: 'test-package',
    Version: '1.0.0'
  }),
  extractGitHubAttributesFromGitHubURL: vi.fn().mockReturnValue({
    owner: 'test-owner',
    repo: 'test-repo'
  }),
  getNpmRepoURLFromGitHubURL: vi.fn().mockResolvedValue(
    'https://github.com/test-owner/test-repo'
  )
}));

vi.mock('../../src/entities/PackageMetadata', () => ({
  PackageMetadata: vi.fn().mockImplementation(() => ({
    id: 1,
    name: 'test-package',
    version: '1.0.0'
  }))
}));

vi.mock('../../src/entities/PackageData', () => ({
  PackageData: vi.fn().mockImplementation(() => ({
    package_id: 1,
    packageMetadata: {
      id: 1,
      name: 'test-package',
      version: '1.0.0'
    },
    content: 'mock-content',
    url: 'mock-url',
    debloat: false,
    jsProgram: 'mock-js-program'
  }))
}));

describe('PackageUploadService', () => {
  const mockRepositoryMethods = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (AppDataSource.getRepository as Mock).mockReturnValue(mockRepositoryMethods);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('uploadContentType', () => {
    it('should successfully upload a package with Content type', async () => {
      
      const mockContent = 'base64-zip-content';
      const mockJSProgram = 'base64-js-program';

      const mockMetadata = {
        name: 'test-package',
        version: '1.0.0',
        id: 1,
      };
      
      const mockData = {
        packageMetadata: mockMetadata,
        content: mockContent,
        debloat: false,
        jsProgram: mockJSProgram,
      };
    
      // Mock create and save for both repositories
      vi.mocked(mockRepositoryMethods.create)
        .mockReturnValueOnce(mockMetadata)  // First call for PackageMetadata
        .mockReturnValueOnce(mockData);     // Second call for PackageData
        
      vi.mocked(mockRepositoryMethods.save)
        .mockResolvedValueOnce(mockMetadata) // First call for PackageMetadata
        .mockResolvedValueOnce(mockData);    // Second call for PackageData

      const result = await PackageUploadService.uploadContentType(
        mockContent,
        mockJSProgram,
        false
      );

      expect(result).toEqual({
        metadata: {
          Name: 'test-package',
          Version: '1.0.0',
          ID: 1,
        },
        data: {
          Content: mockContent,
          JSProgram: mockJSProgram,
        },
      });
    });

    it('should throw ApiError if package already exists', async () => {
        // Mock the helper functions first
      vi.mocked(getPackageJsonFromContentBuffer).mockResolvedValueOnce(
        'mocked-package-json'
      );
  
      vi.mocked(extractNameAndVersionFromPackageJson).mockReturnValueOnce({
        Name: 'test-package',
        Version: '1.0.0'
      });

      // Mock findOne to simulate existing package
      vi.mocked(mockRepositoryMethods.findOne).mockResolvedValueOnce({
        id: 1,
        name: 'test-package',
        version: '1.0.0',
      });

      await expect(
        PackageUploadService.uploadContentType('content', 'jsprogram', false)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('uploadURLType', () => {
    it('should successfully upload a package from GitHub URL', async () => {
      const mockGitHubURL = 'https://github.com/owner/repo';
      const mockJSProgram = 'base64-js-program';
      
      // Mock GitHub API responses
      vi.mocked(octokit.repos.get).mockResolvedValueOnce({
        data: { default_branch: 'main' },
      } as any);
    
      // Mock axios response for zip download
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: Buffer.from('mock-zip-content'),
      });
    
      // Mock package extraction
      vi.mocked(getPackageJsonFromContentBuffer).mockResolvedValueOnce(
        'mocked-package-json'
      );
      
      vi.mocked(extractNameAndVersionFromPackageJson).mockReturnValueOnce({
        Name: 'test-package',
        Version: '1.0.0'
      });

      vi.mocked(extractGitHubAttributesFromGitHubURL).mockReturnValueOnce({
        owner: 'test-owner',
        repo: 'test-repo'
      });
    
      // Mock repository operations
      const mockMetadata = {
        name: 'test-package',
        version: '1.0.0',
        id: 1
      };
    
      const mockData = {
        packageMetadata: mockMetadata,
        content: Buffer.from('mock-zip-content').toString('base64'),
        jsProgram: mockJSProgram,
        debloat: false
      };
    
      vi.mocked(mockRepositoryMethods.create)
        .mockReturnValueOnce(mockMetadata)
        .mockReturnValueOnce(mockData);
    
      vi.mocked(mockRepositoryMethods.save)
        .mockResolvedValueOnce(mockMetadata)
        .mockResolvedValueOnce(mockData);
    
      const result = await PackageUploadService.uploadURLType(mockGitHubURL, mockJSProgram);
    
      // Verify complete response structure
      expect(result).toEqual({
        metadata: {
          Name: 'test-package',
          Version: '1.0.0',
          ID: 1
        },
        data: {
          Content: expect.any(String),
          JSProgram: mockJSProgram
        }
      });
    });

    it('should throw ApiError for unsupported URL format', async () => {
      const invalidURL = 'https://invalid-url.com';

      await expect(
        PackageUploadService.uploadURLType(invalidURL, 'jsprogram')
      ).rejects.toThrow(ApiError);
    });
  });

  describe('getDefaultBranch', () => {
    it('should return default branch for valid repository', async () => {
      vi.mocked(octokit.repos.get).mockResolvedValueOnce({
        data: { default_branch: 'main' },
      } as any);

      const result = await (PackageUploadService as any).getDefaultBranch(
        'owner',
        'repo'
      );

      expect(result).toBe('main');
      expect(octokit.repos.get).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
      });
    });

    it('should throw ApiError when failing to get default branch', async () => {
      vi.mocked(octokit.repos.get).mockRejectedValueOnce(new Error('API Error'));

      await expect(
        (PackageUploadService as any).getDefaultBranch('owner', 'repo')
      ).rejects.toThrow(ApiError);
    });
  });

  describe('normalizePackageURL', () => {
    it('should normalize npm package URL', async () => {
      const npmURL = 'https://npmjs.com/package/test-package';
      vi.mocked(octokit.repos.get).mockResolvedValueOnce({
        data: { default_branch: 'main' },
      } as any);

      const result = await (PackageUploadService as any).normalizePackageURL(npmURL);

      expect(result).toContain('github.com');
      expect(result).toContain('.zip');
    });

    it('should normalize GitHub URL', async () => {
      const githubURL = 'https://github.com/owner/repo';
      vi.mocked(octokit.repos.get).mockResolvedValueOnce({
        data: { default_branch: 'main' },
      } as any);

      const result = await (PackageUploadService as any).normalizePackageURL(
        githubURL
      );

      expect(result).toContain('github.com');
      expect(result).toContain('.zip');
    });
  });
});