/**
 * This function reads a zip file and encodes it to base64.
 * Use to generate a base64 string from a zip file for testing.
 */
import { readFileSync } from 'fs';

export const encodeZipFileToBase64 = (filePath: string): string => {
    try {
        const fileBuffer = readFileSync(filePath);
        if (!fileBuffer) {
            throw new Error('File could not be read');
        }
        return fileBuffer.toString('base64');
    } catch (error) {
        console.error('Error reading file:', error);
        return '';
    }
};

const base64Zip = encodeZipFileToBase64('/home/humphrey/se-phase2/swe-zip-tests/basic-package-master.zip');
console.log(base64Zip);
