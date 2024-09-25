"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestParser_1 = require("./TestParser");
const path = require("path");
var startTime = Date.now();
// Example operation function that just logs each URL
function logUrl(url) {
    console.log('Processing URL:', url);
}
// Example usage
const filePath = path.join(__dirname, 'TestURLs.txt');
const processor = new TestParser_1.UrlProcessor();
processor.processUrlsFromFile(filePath, logUrl);
var elapsedTime = Date.now() - startTime;
var time = (elapsedTime / 1000).toFixed(3);
console.log("function took " + time + " seconds");
