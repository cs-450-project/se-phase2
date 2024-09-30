//Promised-based HTTP client to make requests to the GitHub API
import axios from 'axios';
import dotenv from 'dotenv';
import logger from './Logger';

//loads environment variables GITHUB_TOKEN from .env file
dotenv.config();

//Retrieves Github Token form .env (environment variable file)
const token = process.env.GITHUB_TOKEN;

const GITHUB_API_BASE_URL = 'https://api.github.com';

// Helper function to check if a file exists in the repository
async function fileExists(owner: string, repo: string, filePath: string): Promise<boolean> {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.status === 200;
  } catch (error) {
    logger.info('Something went wrong with connecting to the github api');
    logger.info(error);
    return false;
  }
}

// Function to get the number of contributors in the repo
async function getContributorsCount(owner: string, repo: string): Promise<number> {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contributors`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.length;
  } catch (error) {
    logger.info('Something went wrong with connecting to the github api');
    logger.info(error);
    return 0;
  }
}

// Function to calculate correctness score based on contributors, README, and test files
export async function calculateCorrectnessScore(owner: string, repo: string): Promise<number> {
  let score = 0;

  // 1. Check number of contributors
  const contributorsCount = await getContributorsCount(owner, repo);
  const contributorScore = Math.min(contributorsCount, 30); // Cap the score at 30
  score += contributorScore;

  // 2. Check if README file exists
  const readmeExists = await fileExists(owner, repo, 'README.md');
  if (readmeExists) {
    score += 20;
  }

  // 3. Check if test case files exist
  const testFiles = ["test", "tests", "spec"]; // common test directories
  for (const file of testFiles) {
    const testFileExists = await fileExists(owner, repo, file);
    if (testFileExists) {
      score += 50;
      break; // Stop once we find any test file
    }
  }

  //Correctness Score
  return score;
}
