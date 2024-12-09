import { Builder, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

export async function setupDriver(): Promise<WebDriver> {
  const options = new chrome.Options();
  options.addArguments('--headless'); // Optional for headless testing

  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}