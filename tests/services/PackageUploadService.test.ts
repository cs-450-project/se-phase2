import 'reflect-metadata';

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { PackageUploadService } from '../../src/services/PackageUploadService';
import { AppDataSource } from '../../src/data-source';
import { PackageMetadata } from '../../src/entities/PackageMetadata';
import { PackageData } from '../../src/entities/PackageData';
import AdmZip from 'adm-zip';


// Mock dependencies
vi.mock('../../src/data-source', () => ({
  AppDataSource: {
    getRepository: vi.fn(),
  },
}));

vi.mock('../../src/entities/PackageMetadata', () => ({
  PackageMetadata: vi.fn(),
}));

vi.mock('../../src/entities/PackageData', () => ({
  PackageData: vi.fn(),
}));

vi.mock('adm-zip');

describe('PackageUploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadContentType', () => {
    it('should upload content successfully', async () => {
      // Mock AdmZip and its methods
      const getEntriesMock = vi.fn(() => [
        {
          entryName: 'package.json',
          getData: () =>
            Buffer.from(JSON.stringify({ name: 'test-package', version: '1.0.0' }), 'utf-8'),
        },
      ]);
      (AdmZip as unknown as Mock).mockImplementation(() => ({
        getEntries: getEntriesMock,
      }));

      // Mock repositories
      const saveMock = vi.fn();
      const createMock = vi.fn().mockImplementation(data => data);
      const metadataRepositoryMock = { create: createMock, save: saveMock };
      const dataRepositoryMock = { create: createMock, save: saveMock };

      (AppDataSource.getRepository as Mock).mockImplementation(entity => {
        if (entity === PackageMetadata) {
          return metadataRepositoryMock;
        }
        if (entity === PackageData) {
          return dataRepositoryMock;
        }
      });

      // Input data
      const content = 'base64-zip-content';
      const jsProgram = 'base64-js-program';
      const debloat = false;

      // Call the method
      const result = await PackageUploadService.uploadContentType(content, jsProgram, debloat);

      // Assertions
      expect(AdmZip).toHaveBeenCalledWith(Buffer.from(content, 'base64'));
      expect(getEntriesMock).toHaveBeenCalled();
      expect(saveMock).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        metadata: { Name: 'test-package', Version: '1.0.0', ID: undefined },
        data: { Content: content, JSProgram: jsProgram },
      });
    });

    it('should throw an error if package.json is not found', async () => {
      // Mock AdmZip with no package.json
      const getEntriesMock = vi.fn(() => []);
      (AdmZip as unknown as Mock).mockImplementation(() => ({
        getEntries: getEntriesMock,
      }));

      // Input data
      const content = 'base64-zip-content';
      const jsProgram = 'base64-js-program';
      const debloat = false;

      // Call the method and expect an error
      await expect(
        PackageUploadService.uploadContentType(content, jsProgram, debloat)
      ).rejects.toThrow('Failed to extract name and version from zip content');
    });
  });
});