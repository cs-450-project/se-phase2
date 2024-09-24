"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TestParser_1 = require("./TestParser");
var path = require("path");
var startTime = Date.now();
// Example operation function that just logs each URL
function logUrl(url) {
    console.log('Processing URL:', url);
}
// Example usage
var filePath = path.join(__dirname, 'TestURLs.txt');
var processor = new TestParser_1.UrlProcessor();
processor.processUrlsFromFile(filePath, logUrl);
var elapsedTime = Date.now() - startTime;
var time = (elapsedTime / 1000).toFixed(3);
console.log("function took " + time + " seconds");
