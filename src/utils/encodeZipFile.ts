import { readFileSync } from 'fs';

const encodeZipFileToBase64 = (filePath: string): string => {
    const fileBuffer = readFileSync(filePath);
    return fileBuffer.toString('base64');
};

const base64Zip = encodeZipFileToBase64('/home/humphrey/se-phase2/zip-test-1.zip');
console.log(base64Zip);