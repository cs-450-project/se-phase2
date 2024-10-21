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



import logger from '../utils/logger.js';
import octokit from '../utils/octokit.js';

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
    
    // Fetch the repository information using octokit
    const { data } = await octokit.repos.get({
      owner: owner,
      repo: repo,
    });


    if (data.license) {
      
      if (data.license.spdx_id === 'NOASSERTION') {
        // Check README for license information
        return null;
      }

      return data.license.spdx_id;

    }

  } catch (error) {
    logger.info('Failed to access GitHub API from License');
    logger.info(error);
    return 0;
  }
}


