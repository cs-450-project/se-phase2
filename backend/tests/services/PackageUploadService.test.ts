import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { PackageUploadService } from '../../src/services/PackageUploadService';
import { AppDataSource } from '../../src/data-source';
import { PackageMetadata } from '../../src/entities/PackageMetadata';
import { PackageData } from '../../src/entities/PackageData';
import { ApiError } from '../../src/utils/errors/ApiError';
import AdmZip from 'adm-zip';

vi.mock('../../src/data-source');
vi.mock('adm-zip');

describe('PackageUploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadContentType', () => {
    it('should upload a package successfully', async () => {
      const mockContent = 'mockBase64Content';
      const mockJSProgram = 'mockBase64JSProgram';
      const mockDebloat = true;

      const mockExtracted = { Name: 'mockName', Version: '1.0.0' };
      const mockMetadata = { id: 1, name: 'mockName', version: '1.0.0' };
      const mockData = { content: mockContent, jsProgram: mockJSProgram };

      vi.spyOn(PackageUploadService, 'extractNameAndVersionFromZip').mockResolvedValue(mockExtracted);

      const packageMetadataRepository = {
        findOne: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockReturnValue(mockMetadata),
        save: vi.fn().mockResolvedValue(mockMetadata),
      };
      const packageDataRepository = {
        create: vi.fn().mockReturnValue(mockData),
        save: vi.fn().mockResolvedValue(mockData),
      };

      (AppDataSource.getRepository as Mock).mockImplementation((entity) => {
        if (entity === PackageMetadata) return packageMetadataRepository;
        if (entity === PackageData) return packageDataRepository;
      });

      const result = await PackageUploadService.uploadContentType(mockContent, mockJSProgram, mockDebloat);

      expect(result).toEqual({
        metadata: {
          Name: mockMetadata.name,
          Version: mockMetadata.version,
          ID: mockMetadata.id,
        },
        data: {
          Content: mockData.content,
          JSProgram: mockData.jsProgram,
        },
      });
    });

    it('should throw an error if package already exists', async () => {
      const mockContent = 'mockBase64Content';
      const mockJSProgram = 'mockBase64JSProgram';
      const mockDebloat = true;

      const mockExtracted = { Name: 'mockName', Version: '1.0.0' };
      const mockMetadata = { id: 1, name: 'mockName', version: '1.0.0' };

      vi.spyOn(PackageUploadService, 'extractNameAndVersionFromZip').mockResolvedValue(mockExtracted);

      const packageMetadataRepository = {
        findOne: vi.fn().mockResolvedValue(mockMetadata),
      };

      (AppDataSource.getRepository as Mock).mockImplementation((entity) => {
        if (entity === PackageMetadata) return packageMetadataRepository;
      });

      await expect(PackageUploadService.uploadContentType(mockContent, mockJSProgram, mockDebloat))
        .rejects
        .toThrow(new ApiError('Package exists already.', 409));
    });

    it('should throw an error if extraction fails', async () => {
      const mockContent = 'mockBase64Content';
      const mockJSProgram = 'mockBase64JSProgram';
      const mockDebloat = true;

      vi.spyOn(PackageUploadService, 'extractNameAndVersionFromZip').mockResolvedValue({ Name: null, Version: null });

      await expect(PackageUploadService.uploadContentType(mockContent, mockJSProgram, mockDebloat))
        .rejects
        .toThrow(new ApiError('Failed to extract name and version from zip content', 400));
    });
  });

  describe('uploadURLType', () => {
    it('should log the upload process', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const mockURL = 'http://example.com/package.zip';
      const mockJSProgram = 'mockBase64JSProgram';

      await PackageUploadService.uploadURLType(mockURL, mockJSProgram);

      expect(consoleSpy).toHaveBeenCalledWith('[PackageUploadService] Uploading URL type package to the database.');
    });

    it('should handle errors during upload', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      const mockURL = 'http://example.com/package.zip';
      const mockJSProgram = 'mockBase64JSProgram';

      vi.spyOn(PackageUploadService, 'uploadURLType').mockImplementation(() => {
        throw new Error('Test error');
      });

      await expect(PackageUploadService.uploadURLType(mockURL, mockJSProgram))
        .rejects
        .toThrow('Test error');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[PackageUploadService] An error occurred while adding the URL package to the database.', expect.any(Error));
    });
  });
});