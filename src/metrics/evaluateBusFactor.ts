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

import logger from '../utils/logger.js';
import octokit from '../utils/octokit.js';

// Main function to calculate the Bus Factor of a GitHub repository
export async function evaluateBusFactor(owner: string, repo: string){
  try {
    
    // Fetch contributors data from GitHub API
    const contributorsData = await octokit.repos.listContributors({
        owner: owner,
        repo: repo,
        per_page: 100,
    });
    
    const contributors = contributorsData.data;

    if (contributors.length === 0) {
      return 0;
    }

    const totalContributions = contributors.reduce((sum, contributor) => sum + contributor.contributions, 0);

    const topContributions = contributors[0].contributions;
    const topContributorPercentage = topContributions / totalContributions;

    // Scoring logic based on top contributor's percentage
    if (topContributorPercentage >= 0.8) {
        return 0;
    } else if (topContributorPercentage >= 0.6) {
        return 0.2;
    } else if (topContributorPercentage >= 0.4) {
        return 0.5;
    } else {
        return 1;
    }

  } catch (error) {
      return 0;
  }
}
