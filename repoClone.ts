import simpleGit from 'simple-git';
import * as fs from 'fs';

// Initialize simple-git
const git = simpleGit();

// Repository URL
const repoUrl = 'https://github.com/lkurker/TestRepository';

//We will now clone the repository to the directory of wherever the user is currently located
const currentDir = process.cwd();
const newDir: string = "testingRepo";

//Concatinate the two strings to get the new directory for the repo to clone to
const newDirectory = currentDir.concat("/", newDir);



async function cloneRepository() {
    try {
        console.log("Attempting to clone repository...");

        await git.clone(repoUrl, newDirectory);

        console.log("Repository successfully cloned!!!!");
    }//end try statement

    catch (error) {

        //In case the repository fails to clone
        console.error('Failed to clone repository :(', error);
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

        if (dirFiles[i] == "testsFile.txt") {
            console.log("The file testFile.txt exists in the directory!!!")
        }//end if statement

        else {
            console.log("The current file we're looking at isn't what we need. Moving on to the next file...")
        }

    }//end for loop

    console.log("testing");

}//end checkFiles function

//cloneRepository();

checkFiles(newDirectory);