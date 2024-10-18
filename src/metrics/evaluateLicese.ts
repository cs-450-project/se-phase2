/*
 * Correctness.ts
 * 
 * Description:
 * This file uses the GitHubAPI to find the license compatibility based on the requirements document.
 * We look to see if the repository contains a LICENSE file and if so we look to see if contains the compatible licenses list. 
 * We look README files to see if the license is there if so then we compare it to compatiblelicenses list.
 * If Compatible we output a 1 and if not then output a 0. 
 * 
 * Author: Brayden Devenport
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */


import axios from 'axios';
import * as dotenv from 'dotenv';
import logger from '../utils/Logger';

// Load environment variables from .env
dotenv.config();

// Base URL for GitHub API
const GITHUB_API_BASE_URL = 'https://api.github.com';

// Compatible licenses with LGPL-2.1
const compatibleLicenses = ['lgpl-2.1', 'gpl-2.0', 'gpl-3.0', 'lgpl-3.0'];


// Function to check if the repository license is compatible with LGPL-2.1
export async function evaluateLicense(owner: string, repo: string) {
  const licenseKey = await getRepoLicense(owner, repo);

  if (!licenseKey) {
    return 0;
  }

  if (compatibleLicenses.includes(licenseKey.toLowerCase())) {
    return 1; // Output 1 for compatible license
  } else {
    return 0; // Output 0 for non-compatible license
  }
}


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
    
    if (response.data.license.spdx_id === 'NOASSERTION') {
      // Try to fetch the LICENSE file manually
      const licenseFileResponse = await axios.get(
        `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents/COPYING`, // Adjust the path based on where the license is located
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          },
        }
      );
      
      const licenseContent = Buffer.from(licenseFileResponse.data.content, 'base64').toString('utf-8');
      
      // Check if the license file contains 'GPL-2.0' or other relevant license information
      if (licenseContent.includes('GNU GENERAL PUBLIC LICENSE') && licenseContent.includes('Version 2')) {
        return 'gpl-2.0';  // Return the GPL-2.0 identifier manually
      }
    }

    return response.data.license.spdx_id;

  } catch (error) {
    logger.info('Failed to access GitHub API from License');
    logger.info(error);
    return 0;
  }
}



// Example usage: Check the license compatibility for a repository
//checkLicenseCompatibility('nodists', 'nodist');
