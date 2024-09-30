/*
 * Install.ts
 * 
 * Description:
 * This file will download all necessary packages to the machine being used to run the master program
 * 
 * Author: Grayson DeHerdt
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */

import { execSync } from "node:child_process";
function installPak(packageName:string){
    const installCommand = `npm install ${packageName}`
    try{
    execSync(installCommand, { stdio: 'inherit' });
    console.log(`Successfully installed ${packageName}`);
    }catch (error) {
      console.error(`Failed to install ${packageName}`);  
    }
}

installPak('fs');
installPak('path');
installPak('simple-git');
installPak('axios');
installPak('dotenv');

process.exit(0);