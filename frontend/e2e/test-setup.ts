// e2e/test-setup.ts
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';

let frontendServer: ChildProcess;
let backendServer: ChildProcess;

export async function startDevServer(): Promise<void> {
  return new Promise((resolve) => {
    // Start backend server
    backendServer = spawn('npm', ['run', 'dev'], {
      shell: true,
      stdio: 'inherit',
      cwd: join(__dirname, '../../backend')
    });

    // Start frontend server
    frontendServer = spawn('npm', ['run', 'start'], {
      shell: true,
      stdio: 'inherit',
      cwd: join(__dirname, '../')
    });

    // Wait for both servers
    setTimeout(() => {
      resolve();
    }, 15000); // Give servers time to start
  });
}

export async function stopDevServer(): Promise<void> {
  if (frontendServer) {
    frontendServer.kill();
  }
  if (backendServer) {
    backendServer.kill();
  }
}