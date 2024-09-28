//Calculations of the Rampup metric will be done here by utilising the Github API

//Ensure that we have the required libraries
import axios from 'axios';
import dotenv from 'dotenv';


//Variable that will keep track of how good the ramp-up score is
var rampScore: number = 0;

//load the environment variables
dotenv.config();

//Get the environment variables as a constant
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

//Throw an error if the token is not found
if (!GITHUB_TOKEN) {
    throw new Error("Github Token not found in environment variables.");
}//end if statement

//Function that will get the README file from the repository
async function getReadme() {
    try {
        //Get the README file from the repository
        const response = await axios.get('https://api.github.com/repos/lkurker/TestRepository/readme', {

            headers: {

                Authorization: `token ${GITHUB_TOKEN}`

            }//end headers

        });//end axios.get

        //Return the content of the README file

        return response.data.content;

    }//end try statement

    catch (error) {

        console.error('Failed to get README file :(');

    }//end catch statement

}//end getReadme function

async function analyzeReadme(readmeContent: string) {

    //Checking to see which sections are contained in the README file
    if (readmeContent.includes("## Introduction") || readmeContent.includes("## Getting Started")) {

        rampScore += 10;
        console.log("Testing");

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


//Analyze the content of the README file
async function analyzeReadmeContent() {

    //Get the content of the README file
    const readmeContent = await getReadme();

    //now we need to decode the content of the README file
    const buff = Buffer.from(readmeContent, 'base64');
    const decodedReadmeContent = buff.toString('utf-8');


    //Analyze the content of the README file
    analyzeReadme(decodedReadmeContent);

}//end analyzeReadmeContent function

async function displayRampupScore() {

    await analyzeReadmeContent();

    console.log("Ramp-up score: ", rampScore);

}//end displayRampupScore function

//displayRampupScore();
