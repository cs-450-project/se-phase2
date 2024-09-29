"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//const { execSync } = require('child_process');
const node_child_process_1 = require("node:child_process");
//execSync(Command, { stdio: 'inherit' });
function runCommand(fname) {
    let file = __dirname + '//' + fname;
    const command = `node ${file}`;
    try {
        (0, node_child_process_1.execSync)(command, { stdio: 'inherit' });
        console.log(`Successfully ran ${file}`);
    }
    catch (error) {
        console.error(`Failed to run ${file}`);
    }
}
function runMaster(fname, urlFile) {
    let file = __dirname + `//` + fname;
    const command = `node ${file} ${urlFile}`;
    console.log(`running subprogram ${file}`);
    try {
        (0, node_child_process_1.execSync)(command, { stdio: 'inherit' });
        console.log(`Successfully ran ${urlFile}`);
    }
    catch (error) {
        console.error(`Failed to run ${urlFile}`);
    }
}
var n = 0; //root command loc
//while(n<3){
//n++;
//        console.log(`\n argument ${n} is ${process.argv[n]}`);
//        if (n>5){       console.error(`Failed to run self`) ;
//process.exit(1);
//}
//}
console.log(`${process.argv[n]}`);
try{
while (process.argv[n] != __filename) {
    n++;
    console.log(`${process.argv[n]}`);
}
n = n + 1;
} catch(error){
    console.error(`Failed to run, invalid location or command parsing error`);
}
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
//# sourceMappingURL=run.js.map
