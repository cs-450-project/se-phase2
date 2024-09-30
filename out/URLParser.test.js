"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const URLParser_1 = require("./URLParser"); // Adjust the import as necessary
const url = new URLParser_1.UrlProcessor();
test('tests for null', () => {
    expect(url.processUrlsFromFile('./TestURLs.txt', () => { })).toBe(0);
});
//# sourceMappingURL=URLParser.test.js.map