/*
 * Correctness.ts
 * 
 * Description:
 * This file uses the GitHubAPI to find the maintainers and how quickly they respond to issues.
 * We calculate this by adding up how long some of the issues took to be fixed and storing the total. 
 * Then we divide it by how many issues there were. 
 * 
 * Author: Brayden Devenport
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */


//Promised-based HTTP client to make requests to the GitHub API
import axios from 'axios';
import dotenv from 'dotenv';
import logger from './Logger';

//loads environment variables GITHUB_TOKEN from .env file
dotenv.config();

//Retrieves Github Token form .env (environment variable file)
const token = process.env.GITHUB_TOKEN;

const GITHUB_API_BASE_URL = 'https://api.github.com';

// GitHub allows a maximum of 100 items per page
const ITEMS_PER_PAGE = 100; 

// Helper function to get the "next" URL from the pagination link header
function getNextPage(linkHeader: string | null): string | null {
    if (!linkHeader) return null;
  
    const links = linkHeader.split(',').map(part => part.trim());
    const nextLink = links.find(link => link.includes('rel="next"'));
  
    if (!nextLink) return null;
  
    const nextUrlMatch = nextLink.match(/<([^>]+)>/);
    return nextUrlMatch ? nextUrlMatch[1] : null;
}
// Function to fetch all paginated data from the GitHub API
async function fetchPaginatedData(url: string): Promise<any[]> {
    let results: any[] = [];
    let nextPageUrl: string | null = `${url}&per_page=${ITEMS_PER_PAGE}`;
  
    while (nextPageUrl) {
      try {
        const response = await axios.get(nextPageUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        results = results.concat(response.data);
  
        // Check for the "Link" header to see if there's a next page
        nextPageUrl = getNextPage(response.headers.link || null);
      } catch (error) {
          logger.info('Unable to fetch data');
          logger.info(error);
        return results; // Return what we have in case of failure
      }
    }
  
    return results;
}


// Function to fetch all pull requests (PRs) with pagination
async function getPullRequests(owner: string, repo: string) {
    const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/pulls?state=all`;
    return await fetchPaginatedData(url);
  }
  
  // Function to fetch all issues with pagination
  async function getIssues(owner: string, repo: string) {
    const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/issues?state=open`;
    return await fetchPaginatedData(url);
  }

  // Helper function to calculate the days difference between two dates
  function calculateDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const differenceInTime = d2.getTime() - d1.getTime();
    return Math.floor(differenceInTime / (1000 * 3600 * 24)); // Convert milliseconds to days
  }
  
  // Main function to calculate the "Responsive Maintainer" metric
  export async function calculateResponsiveMaintainer(owner: string, repo: string) {
  
    // Fetch pull requests and issues
    const pullRequests = await getPullRequests(owner, repo);
    const issues = await getIssues(owner, repo);
  
    if (!pullRequests || !issues) {
      return;
    }
  
    // 1. Check when the last update was made (Pull Requests)
    const lastPR = pullRequests[0]; // The most recent pull request
    const lastPRUpdateDate = lastPR ? lastPR.updated_at : null;
    const lastPRClosedDate = lastPR ? lastPR.closed_at : null;
    const daysSinceLastUpdate = lastPRUpdateDate
      ? calculateDaysDifference(lastPRUpdateDate, new Date().toISOString())
      : null;
  
    // 2. Check if there are any issues still open and how long they've been open
    const openIssuesCount = issues.length;
    const issueDurations: number[] = issues.map((issue: { created_at: string; }) => {
      return calculateDaysDifference(issue.created_at, new Date().toISOString());
    });
  
    const averageIssueDuration =
      issueDurations.reduce((sum, duration) => sum + duration, 0) /
      (issueDurations.length || 1);
  
    // Output results
    //console.log(`--- Responsive Maintainer Metrics for ${owner}/${repo} ---`);
    //if (lastPRUpdateDate) {
    //  console.log(`Last Pull Request Updated: ${lastPRUpdateDate}`);
    //  console.log(
    //    `Days Since Last Update: ${
    //      daysSinceLastUpdate !== null ? daysSinceLastUpdate : 'N/A'
    //    }`
    //  );
    //}
    //console.log(`Open Issues: ${openIssuesCount}`);
    //Only ouput we care about is the average issue open duration. 
    return averageIssueDuration;
    //console.log('--- End of Report ---');
  }
  
  // Example usage
 // calculateResponsiveMaintainer('facebook', 'react');
