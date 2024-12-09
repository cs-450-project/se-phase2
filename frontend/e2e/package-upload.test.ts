// e2e/package-upload.test.ts
import { WebDriver, By, until } from 'selenium-webdriver';
import { setupDriver } from './selenium-config';
import * as path from 'path';
import * as fs from 'fs';

const TEST_ZIP_CONTENT = 'UEsDBBQAAAgAAMKFiFkAAAAAAAAAAAAAAAAVAAAAYmFzaWMtcGFja2FnZS1tYXN0ZXIvUEsDBBQAAAgIAOldbVkSXP6h7AEAAAcEAAAhAAAAYmFzaWMtcGFja2FnZS1tYXN0ZXIvcGFja2FnZS5qc29ujVNLi9wwDL7vrxA5tXSTbHspDMMwsHtpYU670ENpwbG1sSe2FSxlhmHpfy/OozspXeghEEvfQ5bklxsAgCKqgMUGikax02WvdKdaLG6n5AkTO4o5/7G6qz4tcYOsk+tlzvHQY4JnxXILynuISoakPByZInhqW0wLc+JxsYGXMQBQDL1RgmWDUdvSkM6KkQzCGAkqdVwP4jzXLUZMf7A5k/GwA0Oa61d4FUwxqv+aXRsXrx17Fym7VHXjYnXkNbhPqCkEJxkiyLLUnrAndkLpci0ml35sYOsWYL5T8nPsgxXpeVPXrRM7NJWmUJ9cli0NnubfKpNXRXR4OVMyuVHfF9Hc4An1Y0apQSyl7HRQIkhwT967qGBr0XvahzGqp2C23i130RQluWYQSiuPB3VyBg4qdXDvMWAUhq3N88VO2yHSviVqPQbl/LUgQPFVBWR4HELExLA95mPF03Hf/oPwZCkohm9K8p48CmKE7XmfT5XpdvBuaZ2cnQimsXdn9Zkpvl/3wTuNkccxHL48LXdshna9aNNQ/mcgtWMe8K/FsBSwz69jA0VAa+3rczg9YI/RYNQOV577vB5cP/uBbXlOTrBkSahCFvmZH9Xd2sS8IaSEgtMle8T+La6wuaYYl1DP6zoucj0WM3Nupu83UEsDBBQAAAgIABdebVn6j3/jHQAAABsAAAAfAAAAYmFzaWMtcGFja2FnZS1tYXN0ZXIvdml0ZXN0LnR4dPNUKM/MyVFISlUoTs4vSk1RSCxWCMssSS0uUQQAUEsBAhQDFAAACAAAwoWIWQAAAAAAAAAAAAAAABUAAAAAAAAAAAAQAP9BAAAAAGJhc2ljLXBhY2thZ2UtbWFzdGVyL1BLAQIUAxQAAAgIAOldbVkSXP6h7AEAAAcEAAAhAAAAAAAAAAAAAAD/gTMAAABiYXNpYy1wYWNrYWdlLW1hc3Rlci9wYWNrYWdlLmpzb25QSwECFAMUAAAICAAXXm1Z+o9/4x0AAAAbAAAAHwAAAAAAAAAAAAAA/4FeAgAAYmFzaWMtcGFja2FnZS1tYXN0ZXIvdml0ZXN0LnR4dFBLBQYAAAAAAwADAN8AAAC4AgAAAAA=';

describe('Package Upload', () => {
  let driver: WebDriver;
  const testZipPath = path.join(__dirname, 'test-files', 'test-package.zip');

  beforeAll(async () => {
    driver = await setupDriver();
    
    // Create test files directory
    if (!fs.existsSync(path.join(__dirname, 'test-files'))) {
      fs.mkdirSync(path.join(__dirname, 'test-files'), { recursive: true });
    }

    // Write base64 content as ZIP file
    const zipBuffer = Buffer.from(TEST_ZIP_CONTENT, 'base64');
    fs.writeFileSync(testZipPath, zipBuffer);
  });

  afterAll(async () => {
    await driver.quit();
    // Cleanup test files
    if (fs.existsSync(testZipPath)) {
      fs.unlinkSync(testZipPath);
    }
  });

  beforeEach(async () => {
    await driver.get('http://localhost:4200/upload');
  });

  it('should load upload page', async () => {
    const title = await driver.wait(
      until.elementLocated(By.css('h2')),
      5000
    );
    expect(await title.getText()).toBe('Upload Package');
  });

  it('should upload package from URL', async () => {
    const urlInput = await driver.findElement(
      By.css('input[placeholder="NPM or GitHub URL"]')
    );
    await urlInput.sendKeys('https://github.com/dodo/node-slug');

    const jsInput = await driver.findElement(By.css('textarea'));
    await jsInput.sendKeys('console.log("test");');

    const uploadButton = await driver.wait(
      until.elementLocated(By.css('.upload-section button')),
      5000
    );
    await uploadButton.click();

    const spinner = await driver.wait(
      until.elementLocated(By.css('.loading-spinner')),
      5000
    );
    expect(await spinner.isDisplayed()).toBe(true);
  });

  it('should show error for invalid URL', async () => {
    const urlInput = await driver.findElement(
      By.css('input[placeholder="NPM or GitHub URL"]')
    );
    await urlInput.sendKeys('invalid-url');

    const uploadButton = await driver.findElement(
      By.css('.upload-section button')
    );
    await uploadButton.click();

    const error = await driver.wait(
      until.elementLocated(By.css('.error')),
      5000
    );
    expect(await error.isDisplayed()).toBe(true);
  });

  it('should show loading state during upload', async () => {
    const urlInput = await driver.findElement(
      By.css('input[placeholder="NPM or GitHub URL"]')
    );
    await urlInput.sendKeys('https://github.com/dodo/node-slug');

    // Wait for button to be clickable
    const uploadButton = await driver.wait(
      until.elementLocated(By.css('.upload-section button')),
      5000
    );
    await uploadButton.click();

    // Wait for and verify spinner
    const spinner = await driver.wait(
      until.elementLocated(By.css('.loading-spinner')),
      5000
    );
    expect(await spinner.isDisplayed()).toBe(true);
  });
});