/*
 * URLParser.ts
 * 
 * Description:
 * This file takes a text file and splits each line as it's own URL. Then it performs an operation on each one
 * 
 * Author: Jacob Esparza
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */

import * as fs from 'fs';
import * as path from 'path';
import logger from '../utils/logger.js';

// Function to read the file, parse URLs, and perform operations
export async function processURLsFromFile(filePath: string, operation: (url: string, num: number) => void): Promise<void> {
    try {

        // Resolve the file path to an absolute path
        const absoluteFilePath = path.resolve(filePath);

        // Read the file content
        const data = fs.readFileSync(absoluteFilePath, 'utf-8');

        // Split the file content into lines (each line is a URL)
        const urls = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // Perform the provided operation on each URL
        urls.forEach((url, index) => {
            operation(url, index + 1);
        });
    } 
    catch (err) {
        logger.info("Something went wrong processing the file from URLParser");
        logger.info(err);
    }
}

