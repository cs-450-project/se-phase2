﻿import simpleGit from 'simple-git';
import * as fs from 'fs';
import * as path from 'path';

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



async function cloneRepository(repoUrl: string) {
    try {
        console.log("Attempting to clone repository...");

        await git.clone(repoUrl, newDirectory);

        await checkFiles(newDirectory);

        analyzeReadme(readmeContent);

        return rampScore;
        
    }//end try statement

    catch (error) {

        //In case the repository fails to clone
        console.error('Failed to clone repository :(');
    }//end catch statement
}//end cloneRepository function


//Now we will go through the cloned repository and list all the files in it

async function checkFiles(directory: string) {

    //Get all the files in the directory
    const dirFiles = fs.readdirSync(directory);

    //List all of the files that are in the directory
    console.log("Files in the directory: ", dirFiles);

    console.log(dirFiles.length);

    //Check if the files in the directory match the files that we want to check
    for (let i: number = 0; i < dirFiles.length; i++) {

        if (dirFiles[i] == "README.md") {

            //add the content of the README file to the readmeContent variable, which will be used to check the ramp-up score
            readmeContent = fs.readFileSync(path.join(directory, dirFiles[i]), 'utf-8');
            break;
        }//end if statement

        else {
            console.log("The current file we're looking at isn't what we need. Moving on to the next file...")
        }

    }//end for loop

    console.log("testing");

}//end checkFiles function

async function analyzeReadme(readmeContent: string) {

    //Checking to see which sections are contained in the README file
    if (readmeContent.includes("## Introduction") || readmeContent.includes("## Getting Started")) {

        rampScore += 10;

    }//end if statement

    if (readmeContent.includes("## Installation") || readmeContent.includes("## Installation Instructions")) {

        rampScore += 10;

    }//end if statement

    if (readmeContent.includes("## Usage")) {

        rampScore += 10;

    }//end if statement

    if (readmeContent.includes("## Contact Information")) {

        rampScore += 10;

    }//end if statement

    if (readmeContent.includes("## Configuration")) {

        rampScore += 10;

    }//end if statement"

}//end analyzeReadme function


