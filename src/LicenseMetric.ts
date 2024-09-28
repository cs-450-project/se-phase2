import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Base URL for GitHub API
const GITHUB_API_BASE_URL = 'https://api.github.com';

// Compatible licenses with LGPL-2.1
const compatibleLicenses = ['lgpl-2.1', 'gpl-2.0', 'gpl-3.0', 'lgpl-3.0'];

// Function to fetch repository license information
async function getRepoLicense(owner: string, repo: string) {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/license`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // GitHub API token from .env file
        },
      }
    );
    
    return response.data.license;
  } catch (error) {
    console.error(`Error fetching license: ${error}`);
    return 0;
  }
}

// Function to check if the repository license is compatible with LGPL-2.1
export async function checkLicenseCompatibility(owner: string, repo: string) {
  const license = await getRepoLicense(owner, repo);

  if (!license) {
    console.log('License information could not be retrieved.');
    return 0;
  }

  const licenseKey = license.spdx_id.toLowerCase(); // Get the SPDX ID of the license

  if (compatibleLicenses.includes(licenseKey)) {
    //Output a 1 if the repo license is compatible with LGPL-2.1
    //console.log(`The repository uses ${license.name}, which is compatible with LGPL-2.1.`);
    return 1;
  } else {
    //Output a 0 if the repo license is not compatible with LGPL-2.1
    //console.log(`The repository uses ${license.name}, which is NOT compatible with LGPL-2.1.`);
    return 0;
  }
}

// Example usage: Check the license compatibility for a repository
//checkLicenseCompatibility('facebook', 'react'); 
