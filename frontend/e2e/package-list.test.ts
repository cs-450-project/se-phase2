// e2e/package-list.test.ts
import { WebDriver, By, until } from 'selenium-webdriver';
import { setupDriver } from './selenium-config';

describe('Package List', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await setupDriver();
  });

  afterAll(async () => {
    await driver.quit();
  });

  it('should load package list', async () => {
    await driver.get('http://localhost:4200');
    
    // Wait for table to load
    const table = await driver.wait(
      until.elementLocated(By.css('table')),
      5000
    );
    
    // Check if packages are loaded
    const rows = await table.findElements(By.css('tbody tr'));
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should show package metrics', async () => {
    await driver.get('http://localhost:4200');
    
    // Wait for table and buttons to load
    await driver.wait(
      until.elementLocated(By.css('table')),
      5000
    );

    // Find and click first View Metrics button using button text
    const metricsButton = await driver.wait(
      until.elementLocated(By.xpath("//button[text()='View Metrics']")),
      5000
    );
    await metricsButton.click();
    
    // Verify metrics are shown
    const metricsSection = await driver.wait(
      until.elementLocated(By.css('app-metrics')),
      5000
    );
    expect(await metricsSection.isDisplayed()).toBe(true);
  });

  it('should show package costs', async () => {
    await driver.get('http://localhost:4200');
    
    // Wait for table and buttons to load
    await driver.wait(
      until.elementLocated(By.css('table')),
      5000
    );

    // Find and click first View Cost button using button text
    const costButton = await driver.wait(
      until.elementLocated(By.xpath("//button[text()='View Cost']")),
      5000
    );
    await costButton.click();
    
    // Verify cost component is shown
    const costSection = await driver.wait(
      until.elementLocated(By.css('app-package-cost')),
      5000
    );
    expect(await costSection.isDisplayed()).toBe(true);
  });
});