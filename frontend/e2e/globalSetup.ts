// e2e/globalSetup.ts
import { startDevServer } from './test-setup';

declare global {
  var __SERVER__: boolean;
}

export default async function globalSetup() {
  console.log('Starting servers for all test suites...');
  await startDevServer();
  // Save reference to server in global variable
  global.__SERVER__ = true;
}