// e2e/globalTeardown.ts
import { stopDevServer } from './test-setup';

export default async function globalTeardown() {
  console.log('Shutting down servers...');
  await stopDevServer();
}