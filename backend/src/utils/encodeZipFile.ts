/**
 * This function reads a zip file and encodes it to base64.
 * Use to generate a base64 string from a zip file for testing.
 */
import { readFileSync } from 'fs';

const encodeZipFileToBase64 = (filePath: string): string => {
    const fileBuffer = readFileSync(filePath);
    return fileBuffer.toString('base64');
};

const base64Zip = encodeZipFileToBase64('/home/humphrey/se-phase2/swe-zip-tests/basic-package-master.zip');
console.log(base64Zip);