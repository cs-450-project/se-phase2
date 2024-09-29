//Calculations of the Rampup metric will be done here by utilising the Github API

//Ensure that we have the required libraries
import axios from 'axios';
import * as dotenv from 'dotenv';


//Variable that will keep track of how good the ramp-up score is
var rampScore: number = 0;

//load the environment variables
dotenv.config();

// Base URL for GitHub API
const GITHUB_API_BASE_URL = 'https://api.github.com';

//Get the environment variables as a constant
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

//Throw an error if the token is not found
if (!GITHUB_TOKEN) {
    throw new Error("Github Token not found in environment variables.");
}//end if statement

//Function that will get the README file from the repository
async function getReadme(owner: string, repo: string) {
    try {
        //Get the README file from the repository
        const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents/README.md`, {

            headers: {

                Authorization: `Bearer ${GITHUB_TOKEN}`

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
async function analyzeReadmeContent(owner:string, repo:string) {

    //Get the content of the README file
    const readmeContent = await getReadme(owner, repo);

     // Check if the readmeContent is null before decoding
     if (!readmeContent) {
        console.error('No README content found to analyze.');
        return; // Exit if there's no content
    }

    //now we need to decode the content of the README file
    const buff = Buffer.from(readmeContent, 'base64');
    const decodedReadmeContent = buff.toString('utf-8');


    //Analyze the content of the README file
    analyzeReadme(decodedReadmeContent);

}//end analyzeReadmeContent function

export async function displayRampupScore(owner: string, repo: string) {

    rampScore = 0;

    await analyzeReadmeContent(owner, repo);

    return rampScore;

}//end displayRampupScore function




