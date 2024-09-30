const { exec } = require('child_process');
const run = require('./run');

describe('run.js', () => {
  it('should run the install command', async () => {
    const output = await new Promise((resolve, reject) => {
      exec('node run.js install', ( ) => {
       
      });
    });
    expect(output).toContain('Successfully ran Install.js');
  });

  it('should run the test command', async () => {
    const output = await new Promise((resolve, reject) => {
      exec('node run.js test', ( ) => {
       
      });
    });
    expect(output).toContain('Successfully ran TestRun.js');
  });

  it('should run the master command with a URL', async () => {
    const output = await new Promise((resolve, reject) => {
      exec('node run.js https://www.npmjs.com/package/express', ( ) => {
        
      });
    });
    expect(output).toContain('running subprogram Master.js to test https://www.npmjs.com/package/express');
  });
});