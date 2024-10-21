/*
 * BusFactor.ts
 * 
 * Description:
 * This file uses the GitHubAPI to calculate the BusFactor. 
 * The BusFactor calulation is made by going to the commits made in the repository seeing how manyy comtis have happend in the last year. 
 * Then looks at those commits made and counts how many people worked from the past year. 
 * It will output how many people have worked on it in a years time. 
 * If there are more than 16 people who have worked on it then just output the 16. 
 * 
 * 
 * Author: Brayden Devenport
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */

import dayjs from 'dayjs';
import logger from '../utils/logger.js';
import octokit from '../utils/octokit.js';

const ONE_YEAR_AGO = dayjs().subtract(1, 'year').toISOString();
// Cap for maximum contributors
const CONTRIBUTOR_CAP = 16; 


// Main function to calculate the Bus Factor of a GitHub repository
export async function evaluateBusFactor(owner: string, repo: string){
  
  const contributors = await getCommits(owner, repo);

  if (!contributors) {
    // Failed to retrieve contributors
    return 0; 
  }

  // Calculate Bus Factor
  const busFactor = calculateBusFactor(contributors);

  // Output the result
  return busFactor

}

// Fetches the list of commits from a GitHub repository in the last year
async function getCommits(owner: string, repo: string): Promise<Set<string> | null> {
  try {
    const contributors = new Set<string>();
    let page = 1;

    const commitData = await octokit.repos.listCommits({
      owner: owner,
      repo: repo,
      per_page: 100,
      since: ONE_YEAR_AGO,
    });

    const commits = commitData.data;

    // If no more commits, break the loop
    if (commits.length === 0) {
      return contributors;
    };

    // Collect contributors from each commit
    commits.forEach((commit: any) => {
      if (commit.author && commit.author.login) {
        contributors.add(commit.author.login);
      }
    });

    // Stop if we've reached the contributor cap
    if (contributors.size >= CONTRIBUTOR_CAP) {
      return contributors;
    };
    
    return contributors;

  } catch (error) {
    //Error fetching commits
    logger.info('Unable to fetch commits for BusFactor');
    logger.info(error);
    return null;
  }
}

 // Calculates the Bus Factor based on the number of contributors
function calculateBusFactor(contributors: Set<string>): number {
  return Math.min(contributors.size, CONTRIBUTOR_CAP);
}



