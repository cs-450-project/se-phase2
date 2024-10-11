/*
 * Correctness.ts
 * 
 * Description:
 * Clones the repo provided and then calculates the RampUp based on that repo. 
 * It will first check to see if the directory exists, and if it does, it will delete the contents and then clone the repo again.
 * This is to ensure that the correct repository is cloned and that the ramp-up score is accurate.
 * To calculate the ramp-up score, the program will check the README file for certain sections. If the sections are present, the score will increase.
 * 
 * Author: Logan Kurker
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */

import simpleGit from 'simple-git';
import * as fs from 'fs';
import * as path from 'path';
import logger from '../utils/Logger';

// Initialize simple-git
const git = simpleGit();

//We will now clone the repository to the directory of wherever the user is currently located
const currentDir = process.cwd();
const newDir: string = "testingRepo";

//Concatinate the two strings to get the new directory for the repo to clone to
const newDirectory = currentDir.concat("/", newDir);

//Variable that will keep track of how good the ramp-up score is
var rampScore: number = 0;

//String that will hold the content of the README file
var readmeContent: string = "";



export async function cloneRepository(repoUrl: string) {
    try {

        //Only clone if the directory does not exist
        if(!fs.existsSync(newDirectory)){

            await git.clone(repoUrl, newDirectory);

        }//end if statement

        //If the directory already exists, delete the contents and then clone again
        else{

            const files = await fs.readdirSync(newDirectory);

            //Delete all of the files in the directory
            for(const file of files){

                const filePath = path.join(newDirectory, file);
                

                await fs.unlinkSync(filePath);

            }//end for loop

            await fs.rmdirSync(newDirectory);
            await git.clone(repoUrl, newDirectory);

        }//end else statement

        

        await checkFiles(newDirectory);

        analyzeReadme(readmeContent);

        return rampScore;
        
    }//end try statement

    catch (error) {
        //In case the repository fails to clone
        logger.info('Failed to clone repository from RepoClone');
        return 0;
    }//end catch statement
}//end cloneRepository function


//Now we will go through the cloned repository and list all the files in it

async function checkFiles(directory: string) {

    //Get all the files in the directory
    const dirFiles = fs.readdirSync(directory);

    //Check if the files in the directory match the files that we want to check
    for (let i: number = 0; i < dirFiles.length; i++) {
        if (dirFiles[i] == "README.md") {
            //add the content of the README file to the readmeContent variable, which will be used to check the ramp-up score
            readmeContent = fs.readFileSync(path.join(directory, dirFiles[i]), 'utf-8');
            break;
        }//end if statement
    }//end for loop
}//end checkFiles function

async function analyzeReadme(readmeContent: string) {

    //Checking to see which sections are contained in the README file
    if (readmeContent.includes("## Introduction") || readmeContent.includes("## Getting Started") || readmeContent.includes("## introduction")) {

        rampScore += 10;

    }//end if statement

    if (readmeContent.includes("## Installation") || readmeContent.includes("## Installation Instructions") || readmeContent.includes("## installation") || readmeContent.includes("## install") || readmeContent.includes("## Install")) {

        rampScore += 10;

    }//end if statement

    if (readmeContent.includes("## Usage") || readmeContent.includes("## usage")) {

        rampScore += 10;

    }//end if statement

    if (readmeContent.includes("## Contact Information")) {

        rampScore += 10;

    }//end if statement

    if (readmeContent.includes("## Configuration") || readmeContent.includes("## configuration")) {

        rampScore += 10;

    }//end if statement"

}//end analyzeReadme function



