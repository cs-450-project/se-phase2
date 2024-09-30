import { execSync } from "node:child_process";
 // Adjust the import as necessary

// const ranker = new Calculate();
const run = require('./run');

test('tests for null', () => {
  expect(run.runMaster('https://github.com/cloudinary/cloudinary_npm')).toBe(0);
});

/*test('tests for null', () => {
  expect(run.runMaster()).toBeNull();
});*/
