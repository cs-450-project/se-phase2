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

var base64Zip = encodeZipFileToBase64('/home/humphrey/se-phase2/testing-zips/basic-package-bad-name.zip');
console.log(base64Zip + '\n');
var base64Zip = encodeZipFileToBase64('/home/humphrey/se-phase2/testing-zips/basic-package-v2.zip');
console.log(base64Zip + '\n');
var base64Zip = encodeZipFileToBase64('/home/humphrey/se-phase2/testing-zips/basic-package-v10.zip');
console.log(base64Zip + '\n');
