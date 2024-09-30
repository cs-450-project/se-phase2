/*
 * BusFactor.ts
 * 
 * Description:
 * This file uses the GitHubAPI to calculate the BusFactor
 * 
 * Author: Brayden Devenport
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */


//Promised-based HTTP client to make requests to the GitHub API
import axios from 'axios';
import dotenv from 'dotenv';


//loads environment variables GITHUB_TOKEN from .env file
dotenv.config();

//Retrieves Github Token form .env (environment variable file)
const token = process.env.GITHUB_TOKEN;

const GITHUB_API_BASE_URL = 'https://api.github.com';

// Function to fetch commits and map developers to modules (files/directories)
async function getCommits(owner: string, repo: string) {
  try {
    // Send GET request to fetch commits (100 commits per page)
    const response = await axios.get(
      `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/commits?per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Extract commits data
    const commits = response.data;

    // Dictionary to map modules (files/directories) to developers
    const moduleDeveloperMap: { [key: string]: Set<string> } = {};

    // Process each commit to map developers to the files they've worked on
    for (const commit of commits) {
      const author = commit.commit.author.name;
      const commitUrl = commit.url;

      // Fetch the specific commit data to get the list of modified files
      const commitDetails = await axios.get(commitUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const filesChanged = commitDetails.data.files;

      // Map the developer to each file/module they've worked on
      filesChanged.forEach((file: { filename: string }) => {
        const module = file.filename.split('/')[0]; // First part of the file path, treat it as a module
        if (!moduleDeveloperMap[module]) {
          moduleDeveloperMap[module] = new Set();
        }
        moduleDeveloperMap[module].add(author);
      });
    }

    return moduleDeveloperMap;

  } catch (error) {
    return null;
  }
}
// Function to calculate the Bus Factor based on module-developer mapping
function calculateBusFactor(moduleDeveloperMap: { [key: string]: Set<string> }) {
  let busFactor = 0;

  // Iterate over each module and count unique developers
  for (const module in moduleDeveloperMap) {
    const developers = moduleDeveloperMap[module];

    // If only one developer is working on a module, increase the Bus Factor
    if (developers.size === 1) {
      busFactor++;
    }
  }

  return busFactor;
}

// Main function to calculate Bus Factor
export async function getBusFactor(owner: string, repo: string) {
  const moduleDeveloperMap = await getCommits(owner, repo);

  if (!moduleDeveloperMap) {
    return 0;
  }

  // Calculate the Bus Factor based on non-overlapping developer work
  const busFactor = calculateBusFactor(moduleDeveloperMap);

  return busFactor;

}

//getBusFactor('facebook', 'react');