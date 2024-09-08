import * as fs from 'fs';
import * as path from 'path';

// Function to read the file, parse URLs, and perform operations
async function processUrlsFromFile(filePath: string, operation: (url: string) => void): Promise<void> {
    try {
        // Read the file content
        const data = fs.readFileSync(filePath, 'utf-8');

        // Split the file content into lines (each line is a URL)
        const urls = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // Perform the provided operation on each URL
        urls.forEach(operation);
    } catch (err) {
        console.error('Error reading the file:', err);
    }
}

// Example operation function that just logs each URL
function logUrl(url: string): void {
    console.log('Processing URL:', url);
}

// Example usage
const filePath = path.join(__dirname, 'TestURLs.txt');
processUrlsFromFile(filePath, logUrl);
