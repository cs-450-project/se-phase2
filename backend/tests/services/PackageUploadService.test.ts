import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PackageUploadService } from '../../src/services/PackageUploadService';
import { AppDataSource } from '../../src/data-source';
import { ApiError } from '../../src/utils/errors/ApiError';
import axios from 'axios';
import AdmZip from 'adm-zip';

// Mock entities
vi.mock('../../src/entities/PackageMetadata', () => ({
  PackageMetadata: vi.fn().mockImplementation(() => ({
    id: 1,
    name: 'test-package',
    version: '1.0.0'
  }))
}));

vi.mock('../../src/entities/PackageData', () => ({
  PackageData: vi.fn().mockImplementation(() => ({
    packageId: 1,
    packageMetadata: {
      id: 1,
      name: 'test-package',
      version: '1.0.0'
    },
    content: 'mock-content',
    jsProgram: 'mock-program',
    url: undefined,
    debloat: false
  }))
}));

vi.mock('../../src/entities/PackageRating', () => ({
  PackageRating: vi.fn().mockImplementation(() => ({
    packageId: 1,
    packageMetadata: {
      id: 1,
      name: 'test-package',
      version: '1.0.0'
    },
    busFactor: 0.8,
    busFactorLatency: 0.1,
    correctness: 0.7,
    correctnessLatency: 0.1,
    rampUp: 0.9,
    rampUpLatency: 0.1,
    responsiveMaintainer: 0.8,
    responsiveMaintainerLatency: 0.1,
    licenseScore: 1.0,
    licenseScoreLatency: 0.1,
    goodPinningPractice: 0.6,
    goodPinningPracticeLatency: 0.1,
    pullRequest: 0.7,
    pullRequestLatency: 0.1,
    netScore: 0.8,
    netScoreLatency: 0.1
  }))
}));

// Mock all external dependencies
vi.mock('axios');
vi.mock('../../src/utils/octokit');
vi.mock('../../src/data-source');
vi.mock('../../src/services/evaluators/evaluateMetrics');
vi.mock('fs/promises');

// Mock package helper functions
vi.mock('../../src/utils/packageHelpers', () => ({
  getPackageJsonFromContentBuffer: vi.fn().mockResolvedValue(JSON.stringify({
    name: 'test-package',
    version: '1.0.0',
    repository: {
      type: 'git',
      url: 'https://github.com/test-owner/test-repo'
    }
  })),
  extractNameAndVersionFromPackageJson: vi.fn().mockReturnValue({
    name: 'test-package',
    version: '1.0.0'
  }),
  extractGithubUrlFromPackageJson: vi.fn().mockResolvedValue('https://github.com/test-owner/test-repo'),
  normalizeToGithubUrl: vi.fn().mockResolvedValue('https://github.com/test-owner/test-repo'),
  extractGithubAttributesFromGithubUrl: vi.fn().mockReturnValue({
    owner: 'test-owner',
    repo: 'test-repo'
  })
}));

// Mock evaluateMetrics
vi.mock('../../src/services/evaluators/evaluateMetrics', () => ({
  evaluateMetrics: vi.fn().mockResolvedValue({
    busFactor: 0.8,
    busFactorLatency: 0.1,
    correctness: 0.7,
    correctnessLatency: 0.1,
    rampUp: 0.9,
    rampUpLatency: 0.1,
    responsiveMaintainers: 0.8,
    responsiveMaintainersLatency: 0.1,
    license: 1.0,
    licenseLatency: 0.1,
    dependencyPinning: 0.6,
    dependencyPinningLatency: 0.1,
    codeReview: 0.7,
    codeReviewLatency: 0.1,
    netScore: 0.8,
    netScoreLatency: 0.1
  })
}));

describe('PackageUploadService', () => {
  const mockContent = Buffer.from('test content').toString('base64');
  const mockJsProgram = 'console.log("test");';
  
  // Setup repository mocks
  const mockMetadata = {
    id: 1,
    name: 'test-package',
    version: '1.0.0'
  };

  const mockData = {
    packageId: 1,
    content: mockContent,
    jsProgram: mockJsProgram
  };

  const mockRating = {
    packageId: 1,
    netScore: 0.8
  };

  const mockRepositoryMethods = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset repository mocks
    mockRepositoryMethods.findOne.mockResolvedValue(null);
    mockRepositoryMethods.create.mockReturnValue(mockMetadata);
    mockRepositoryMethods.save.mockResolvedValue(mockMetadata);

    // Mock AppDataSource.getRepository
    (AppDataSource.getRepository as any) = vi.fn().mockReturnValue(mockRepositoryMethods);
  });

  describe('uploadContentType', () => {
  
    it('should throw error for empty content', async () => {
      await expect(
        PackageUploadService.uploadContentType('', mockJsProgram, false)
      ).rejects.toThrow(ApiError);
    });

    it('should throw error for existing package', async () => {
      mockRepositoryMethods.findOne.mockResolvedValueOnce(mockMetadata);

      await expect(
        PackageUploadService.uploadContentType(mockContent, mockJsProgram, false)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('uploadUrlType', () => {
    const validUrl = 'https://github.com/test-owner/test-repo';

    beforeEach(() => {
      (axios.get as any).mockResolvedValue({
        data: Buffer.from('test content')
      });
    });
    it('should throw error for empty URL', async () => {
      await expect(
        PackageUploadService.uploadUrlType('', mockJsProgram)
      ).rejects.toThrow(ApiError);
    });

    it('should throw error when GitHub API fails', async () => {
      (axios.get as any).mockRejectedValueOnce(new Error('GitHub API error'));

      await expect(
        PackageUploadService.uploadUrlType(validUrl, mockJsProgram)
      ).rejects.toThrow(ApiError);
    });
  });
});