//const { execSync } = require('child_process');
import { execSync } from "node:child_process";
//execSync(Command, { stdio: 'inherit' });
function runCommand(file:string){
    const command = `node ${file}`
    try{
    execSync(command, { stdio: 'inherit' });
    console.log(`Successfully ran ${file}`);
    }catch (error) {
      console.error(`Failed to run ${file}`)  ;
    }
}
    function runMaster(file:string, urlFile:string){
        const command = `node ${file} ${urlFile}`
        try{
        execSync(command, { stdio: 'inherit' });
        console.log(`Successfully ran ${urlFile}`);
        }catch (error) {
          console.error(`Failed to run ${urlFile}`) ; 
        }
    
 }
var n = 0;
//while(n<3){
//n++;
//        console.log(`\n argument ${n} is ${process.argv[n]}`);
//        if (n>5){       console.error(`Failed to run self`) ;
//process.exit(1);
//}
//}
n = 2
const commandString:string = process.argv[n];
if (commandString == null){
    console.error(`Failed to run`);
    process.exit(1) ;
}
if (commandString == 'install'){
    runCommand('Install.js');
}
else
if (commandString == 'test'){
    runCommand('TestRun.js');
}
else {
    const url:string = process.argv[n];
    runMaster('Master.js',url);
}