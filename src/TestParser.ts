import * as fs from 'fs';
import * as path from 'path';

export class UrlProcessor {
    
    // Function to read the file, parse URLs, and perform operations
    public async processUrlsFromFile(filePath: string, operation: (url: string) => void): Promise<void> {
        try {
            // Read the file content
            const data = fs.readFileSync(filePath, 'utf-8');

            // Split the file content into lines (each line is a URL)
            const urls = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);

            // Perform the provided operation on each URL
            urls.forEach(operation);
        } 
        catch (err) {
            console.error('Error reading the file:', err);
        }
    }
}

