"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//const { execSync } = require('child_process');
const node_child_process_1 = require("node:child_process");
//execSync(Command, { stdio: 'inherit' });
function runCommand(file) {
    const command = `node ${file}`;
    try {
        (0, node_child_process_1.execSync)(command, { stdio: 'inherit' });
        console.log(`Successfully ran ${file}`);
    }
    catch (error) {
        console.error(`Failed to run ${file}`);
    }
}
function runMaster(file, urlFile) {
    const command = `node ${file} ${urlFile}`;
    try {
        (0, node_child_process_1.execSync)(command, { stdio: 'inherit' });
        console.log(`Successfully ran ${urlFile}`);
    }
    catch (error) {
        console.error(`Failed to run ${urlFile}`);
    }
}
var n = 0;
while (n < 3) {
    n++;
    console.log(`\n argument ${n} is ${process.argv[n]}`);
    //        if (n>5){       console.error(`Failed to run self`) ;
    //process.exit(1);
}
//}
n = 2;
const commandString = process.argv[n];
if (commandString == null) {
    console.error(`Failed to run`);
    process.exit(1);
}
if (commandString == 'install') {
    runCommand('Install.js');
}
else if (commandString == 'test') {
    runCommand('TestRun.js');
}
else {
    const url = process.argv[n];
    runMaster('Master.js', url);
}
