/*
 * Correctness.ts
 * 
 * Description:
 * Calculations of the Rampup metric will be done here by utilising the Github API. This file will first access the README file
 * from the repository and then check for the presence of certain sections. If the sections are present, the rampup score will increase.
 * Unlike the cloning 
 * 
 * Author: Logan Kurker
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */

// Ensure that we have the required libraries

import logger from '../logger.js';

// Import octokit
import octokit from '../utils/octokit.js';

//Variable that will keep track of how good the ramp-up score is
var rampScore: number = 0;

export async function evaluateRampUp(owner: string, repo: string) {
    logger.debug(`Evaluating ramp-up score for ${owner}/${repo}`);
    rampScore = 0;

    await analyzeReadmeContent(owner, repo);

    logger.info(`Final ramp-up score for ${owner}/${repo}: ${rampScore}`);
    return rampScore;
}// end displayRampupScore function

//Function that will get the README file from the repository
async function getReadme(owner: string, repo: string) {
    try {
        logger.debug(`Fetching README for ${owner}/${repo}`);
        const readmeData = await octokit.repos.getReadme({
            owner: owner,
            repo: repo,
        });

        const readmeContent = Buffer.from(readmeData.data.content, 'base64').toString('utf-8');
        logger.debug(`Fetched README content for ${owner}/${repo}`);

        //Return the content of the README file
        return readmeContent;
    } catch (error) {
        logger.error(`Failed to access GitHub API for ${owner}/${repo}`);
        logger.error(error);
    }
}//end getReadme function

async function analyzeReadme(readmeContent: string) {
    logger.debug(`Analyzing README content`);

    //Checking to see which sections are contained in the README file
    if (readmeContent.includes("## Introduction") || readmeContent.includes("## Getting Started") || readmeContent.includes("## introduction")) {
        rampScore += 0.2;
        logger.debug(`Found Introduction section, rampScore: ${rampScore}`);
    }

    if (readmeContent.includes("## Installation") || readmeContent.includes("## Installation Instructions") || readmeContent.includes("## installation") || readmeContent.includes("## install") || readmeContent.includes("## Install")) {
        rampScore += 0.2;
        logger.debug(`Found Installation section, rampScore: ${rampScore}`);
    }

    if (readmeContent.includes("## Usage") || readmeContent.includes("## usage")) {
        rampScore += 0.2;
        logger.debug(`Found Usage section, rampScore: ${rampScore}`);
    }

    if (readmeContent.includes("## Contact Information")) {
        rampScore += 0.2;
        logger.debug(`Found Contact Information section, rampScore: ${rampScore}`);
    }

    if (readmeContent.includes("## Configuration") || readmeContent.includes("## configuration")) {
        rampScore += 0.2;
        logger.debug(`Found Configuration section, rampScore: ${rampScore}`);
    }
}//end analyzeReadme function

//Analyze the content of the README file
async function analyzeReadmeContent(owner: string, repo: string) {
    logger.debug(`Starting analysis of README content for ${owner}/${repo}`);

    //Get the content of the README file
    const readmeContent = await getReadme(owner, repo);

    // Check if the readmeContent is null before decoding
    if (!readmeContent) {
        logger.info(`No README content found for ${owner}/${repo}`);
        return; // Exit if there's no content
    }

    //Analyze the content of the README file
    analyzeReadme(readmeContent);
    logger.debug(`Completed analysis of README content for ${owner}/${repo}`);
}//end analyzeReadmeContent function


