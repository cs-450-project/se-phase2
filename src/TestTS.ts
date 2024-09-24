import { UrlProcessor } from "./TestParser";
import * as path from 'path';

var startTime = Date.now();
// Example operation function that just logs each URL
function logUrl(url: string): void {
    console.log('Processing URL:', url);
}

// Example usage
const filePath = path.join(__dirname, 'TestURLs.txt');
const processor = new UrlProcessor();

processor.processUrlsFromFile(filePath, logUrl);


var elapsedTime = Date.now() - startTime;
  var time = (elapsedTime / 1000).toFixed(3);
  console.log("function took " + time + " seconds");