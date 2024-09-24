import { UrlProcessor } from "./TestParser";
import * as path from 'path';

// Example operation function that just logs each URL
function logUrl(url: string): void {
    console.log('Processing URL:', url);
}
/*
// Example usage
const filePath = path.join(__dirname, 'TestURLs.txt');
const processor = new UrlProcessor();

processor.processUrlsFromFile(filePath, logUrl);
*/