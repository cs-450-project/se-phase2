/*
 * BusFactor.ts
 * 
 * Description:
 * This file uses the GitHubAPI to calculate the BusFactor. 
 * The BusFactor calculation is made by going to the commits made in the repository seeing how many commits have happened in the last year. 
 * Then looks at those commits made and counts how many people worked from the past year. 
 * It will output how many people have worked on it in a year's time. 
 * If there are more than 16 people who have worked on it then just output the 16. 
 * 
 * Author: Brayden Devenport
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */

import logger from '../logger.js';
import octokit from '../utils/octokit.js';

// Main function to calculate the Bus Factor of a GitHub repository
export async function evaluateBusFactor(owner: string, repo: string): Promise<number> {
  logger.info(`Starting Bus Factor evaluation for repository: ${owner}/${repo}`);
  
  try {
    // Fetch contributors data from GitHub API
    logger.debug(`Fetching contributors data for repository: ${owner}/${repo}`);
    const contributorsData = await octokit.repos.listContributors({
      owner: owner,
      repo: repo,
      per_page: 100,
    });
    
    const contributors = contributorsData.data;

    if (contributors.length === 0) {
      logger.info(`No contributors found for repository: ${owner}/${repo}`);
      return 0;
    }

    logger.debug(`Contributors data: ${JSON.stringify(contributors)}`);

    const totalContributions = contributors.reduce((sum, contributor) => sum + contributor.contributions, 0);
    logger.debug(`Total contributions: ${totalContributions}`);

    const topContributions = contributors[0].contributions;
    const topContributorPercentage = topContributions / totalContributions;
    logger.debug(`Top contributor contributions: ${topContributions}`);
    logger.debug(`Top contributor percentage: ${topContributorPercentage}`);

    // Scoring logic based on top contributor's percentage
    let busFactorScore;
    if (topContributorPercentage >= 0.8) {
      busFactorScore = 0;
    } else if (topContributorPercentage >= 0.6) {
      busFactorScore = 0.2;
    } else if (topContributorPercentage >= 0.4) {
      busFactorScore = 0.5;
    } else {
      busFactorScore = 1;
    }

    logger.info(`Bus Factor score for repository ${owner}/${repo}: ${busFactorScore}`);
    return busFactorScore;

  } catch (error) {
    logger.error(`Error evaluating Bus Factor for repository ${owner}/${repo}: ${(error as Error).message}`);
    return 0;
  }
}