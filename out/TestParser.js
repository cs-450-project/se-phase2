"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlProcessor = void 0;
const fs = require("fs");
class UrlProcessor {
    // Function to read the file, parse URLs, and perform operations
    processUrlsFromFile(filePath, operation) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
}
exports.UrlProcessor = UrlProcessor;
