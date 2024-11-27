import { describe, it, expect, vi, Mock } from 'vitest';
import { readFileSync } from 'fs';
import { encodeZipFileToBase64 } from '../../src/utils/encodeZipFile';

vi.mock('fs', () => ({
    readFileSync: vi.fn()
}));

describe('encodeZipFileToBase64', () => {
    it('should encode a zip file to base64', () => {
        const mockFilePath = '/mock/path/to/zipfile.zip';
        const mockFileBuffer = Buffer.from('mock file content');
        const expectedBase64 = mockFileBuffer.toString('base64');

        (readFileSync as Mock).mockReturnValue(mockFileBuffer);

        const result = encodeZipFileToBase64(mockFilePath);

        expect(readFileSync).toHaveBeenCalledWith(mockFilePath);
        expect(result).toBe(expectedBase64);
    });
});