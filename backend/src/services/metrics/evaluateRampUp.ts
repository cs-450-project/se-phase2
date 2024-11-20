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

import logger from '../../utils/logger.js';
// Import octokit
import octokit from '../../utils/octokit.js';

export async function evaluateRampUp(owner: string, repo: string) {
    logger.debug(`Evaluating ramp-up score for ${owner}/${repo}`);

    const rampScore = await getReadme(owner, repo);

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
        return analyzeReadme(readmeContent);

    } catch (error) {
        logger.error(`Failed to access GitHub API for ${owner}/${repo}`);
        logger.error(error);
        return 0;
    }
}//end getReadme function

async function analyzeReadme(readmeContent: string) {
    let rampScore = 0;

    logger.debug(`Analyzing README content`);
    const sections = [
        { name: 'Installation', weight: 0.2 },
        { name: 'Introduction', weight: 0.2},
        { name: 'Usage', weight: 0.2 },
        { name: 'Contributing', weight: 0.1 },
        { name: 'Contributions', weight: 0.1 },
        { name: 'Getting Started', weight: 0.2 },
        { name: 'Documentation', weight: 0.1 },
        { name: 'License', weight: 0.1 },
        { name: 'Support', weight: 0.1 }
    ];

    // Analyze presence and quality of sections
    sections.forEach(section => {
        const regex = new RegExp(`#\\s*${section.name}`, 'i');
        if (regex.test(readmeContent)) {
            rampScore += section.weight;
            logger.debug(`Section "${section.name}" found and scored.`);
        } else {
            logger.debug(`Section "${section.name}" not found.`);
        }
    });
  // Cap the rampScore at 1
  rampScore = parseFloat((Math.min(rampScore, 1)).toFixed(2));

  logger.debug(`Final rampScore: ${rampScore}`);

  return rampScore;
}//end analyzeReadme function
