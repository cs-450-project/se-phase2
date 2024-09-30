"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Adjust the import as necessary
// const ranker = new Calculate();
const run = require('./run');
test('tests for null', () => {
    expect(run.runMaster('https://github.com/cloudinary/cloudinary_npm')).toBe(0);
});
/*test('tests for null', () => {
  expect(run.runMaster()).toBeNull();
});*/
//# sourceMappingURL=TestRanker.test2.js.map