/*
 * CorrectnessMetric.ts
 * 
 * Description:
 * This file uses the GitHubAPI to calculate the CorrectnessMetric
 * We have a score the max value is 100 and we check to see if there is a README file, test files, and how many contributors are in the repository. 
 * We score that if there is a README file then we add 20 to the score. And if there are test files then we add 50 to the score. 
 * We also add to the score how many contributors there are in the repository with a cap of 30. 
 * 
 * Author: Brayden Devenport
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */

import logger from '../../utils/logger.js';
import octokit from '../../utils/octokit.js';

// Function to calculate correctness score based on contributors, README, and test files
export async function evaluateCorrectness(owner: string, repo: string): Promise<number> {
  logger.info(`Starting Correctness evaluation for repository: ${owner}/${repo}`);
  
  let score = 0;

  try {
    // 1. Check number of contributors
    const contributorsCount = await getContributorsCount(owner, repo);
    const contributorScore = Math.min(contributorsCount, 60) / 200; // Cap the score at 30
    score += contributorScore;
    logger.debug(`Contributors count: ${contributorsCount}, Contributor score: ${contributorScore}`);

    // 2. Check if README file exists
    const readme = await readmeExists(owner, repo);
    if (readme) {
      score += 0.2;
      logger.info('README file found. Added 0.2 to the score.');
    } else {
      logger.info('README file not found.');
    }

    // 3. Check if test files exist
    const testFileExists = await testsExists(owner, repo);
    if (testFileExists) {
      score += 0.5;
      logger.info('Test files found. Added 0.5 to the score.');
    } else {
      logger.info('No test files found.');
    }

    logger.info(`Final Correctness score for repository ${owner}/${repo}: ${score}`);
  } catch (error) {
    logger.error(`Error during Correctness evaluation for repository ${owner}/${repo}: ${(error as Error).message}`);
  }

  return score;
}

// Helper function to check if a file exists in the repository
async function readmeExists(owner: string, repo: string): Promise<boolean> {
  try {
    logger.debug(`Checking for README file in repository: ${owner}/${repo}`);
    const readmeData = await octokit.repos.getReadme({
      owner: owner,
      repo: repo,
    });

    const exists = readmeData.data && readmeData.data.content ? true : false;
    logger.debug(`README file exists: ${exists}`);
    return exists;
  } catch (error) {
    logger.error(`Error checking for README file in repository ${owner}/${repo}: ${(error as Error).message}`);
    return false;
  }
}

// Helper function to check if test files exist in the repository
async function testsExists(owner: string, repo: string): Promise<boolean> {
  try {
    logger.debug(`Checking for test files in repository: ${owner}/${repo}`);
    // Fetch package.json content
    const packageJsonData = await octokit.repos.getContent({
      owner: owner,
      repo: repo,
      path: 'package.json',
    });

    const packageJsonContent = Buffer.from((packageJsonData.data as any).content, 'base64').toString('utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    const hasTestScript = !!(packageJson.scripts && packageJson.scripts.test);
    logger.debug(`Test script exists in package.json: ${hasTestScript}`);
    return hasTestScript;
  } catch (error: any) {
    if (error.status === 404) {
      logger.info(`package.json not found in repository ${owner}/${repo}`);
      return false; // Return false if package.json is not found
    } else {
      logger.error(`Error checking for test files in repository ${owner}/${repo}: ${error.message}`);
      return false; // Return false for other errors as well
    }
  }
}

// Function to get the number of contributors in the repo
async function getContributorsCount(owner: string, repo: string): Promise<number> {
  try {
    logger.debug(`Fetching contributors for repository: ${owner}/${repo}`);
    const { data } = await octokit.repos.listContributors({
      owner: owner,
      repo: repo,
    });

    const count = data.length;
    logger.debug(`Number of contributors: ${count}`);
    return count;
  } catch (error) {
    logger.error(`Error fetching contributors for repository ${owner}/${repo}: ${(error as Error).message}`);
    return 0;
  }
}