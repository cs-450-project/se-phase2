"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const TestParser_1 = require("./TestParser");
const path = __importStar(require("path"));
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
//# sourceMappingURL=TestTS.js.map