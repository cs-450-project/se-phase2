/*
 * CorrectnessMetric.ts
 * 
 * Description:
 * This file uses the GitHubAPI to calculate the CorrectnessMetric
 * We have a score the max value is 100 and we check to see if there is a README file, test files, and how many contributors are in the repostitory. 
 * We score that if there is a README file then we add 20 to the score. And if there are test files then we add 50 to the score. 
 * We also add to the score how many contributors there are in the repository with a cap of 30. 
 * 
 * Author: Brayden Devenport
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */
//Promised-based HTTP client to make requests to the GitHub API
import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import octokit from '../utils/octokit.js';

//loads environment variables GITHUB_TOKEN from .env file
dotenv.config();

//Retrieves Github Token form .env (environment variable file)
const token = process.env.GITHUB_TOKEN;

const GITHUB_API_BASE_URL = 'https://api.github.com';

// Function to calculate correctness score based on contributors, README, and test files
export async function evaluateCorrectness(owner: string, repo: string): Promise<number> {
  let score = 0;

  // 1. Check number of contributors
  const contributorsCount = await getContributorsCount(owner, repo);
  const contributorScore = Math.min(contributorsCount, 30); // Cap the score at 30
  score += contributorScore;

  // 2. Check if README file exists
  const readme = await readmeExists(owner, repo);

  if (readme) {
    score += 20;
  }

  // 3. Check if test files exist
  const testFileExists = await testsExists(owner, repo);

  if (testFileExists) {
    score += 50;
  }

  //Correctness Score
  return score;

}


// Helper function to check if a file exists in the repository
async function readmeExists(owner: string, repo: string): Promise<boolean> {
  try {
    
    const readmeData = await octokit.repos.getReadme({
      owner: owner,
      repo: repo,
    });

    return readmeData.data && readmeData.data.content ? true : false;

  } catch (error) {
    logger.info('Something went wrong with connecting to the github api from Correctness');
    logger.info(error);
    return false;
  }
}

async function testsExists(owner: string, repo: string): Promise<boolean> {
  try {
    
    // Fetch package.json content
    const packageJsonData = await octokit.repos.getContent({
        owner: owner,
        repo: repo,
        path: 'package.json',
    });

    const packageJsonContent = Buffer.from((packageJsonData.data as any).content, 'base64').toString('utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    const hasTestScript = !!(packageJson.scripts && packageJson.scripts.test);
    return hasTestScript;
    
  } catch (error: any) {
      if (error.status === 404) {
          return false; // Return false if package.json is not found
      } else {
          return false; // Return false for other errors as well
      }
   }
}
// Function to get the number of contributors in the repo
async function getContributorsCount(owner: string, repo: string): Promise<number> {
  try {
    
    const { data } = await octokit.repos.listContributors({
      owner: owner,
      repo: repo,
    });

    return data.length;

  } catch (error) {
    logger.info('Something went wrong with connecting to the github api from Correctness');
    logger.info(error);
    return 0;
  }
}


