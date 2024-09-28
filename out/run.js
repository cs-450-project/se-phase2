//const { execSync } = require('child_process');
import { execSync } from "node:child_process";
//execSync(Command, { stdio: 'inherit' });
function runCommand(fname:string){
    let file:string = __dirname+'//'+fname;
    const command = `node ${file}`
    try{
    execSync(command, { stdio: 'inherit' });
    console.log(`Successfully ran ${file}`);
    }catch (error) {
      console.error(`Failed to run ${file}`)  ;
    }
}
    function runMaster(fname:string, urlFile:string){
        let file:string = __dirname+`//`+fname;
        const command = `node ${file} ${urlFile}`
        console.log(`running subprogram ${file} to test ${urlFile}`);
        try{
        execSync(command, { stdio: 'inherit' });
        console.log(`Successfully ran ${urlFile}`);
        }catch (error) {
          console.error(`Failed to run ${urlFile}`) ; 
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
try{
while (process.argv[n] != __filename){
    n++;
}
 n=n+1
} catch(error){
    console.error(`Failed to run program`);
}
const commandString:string = process.argv[n];
if (commandString == null){
    console.error(`Failed to run, invalid arguments`);
    process.exit(0) ;
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
