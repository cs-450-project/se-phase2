import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Base URL for GitHub API
const GITHUB_API_BASE_URL = 'https://api.github.com';

// Compatible licenses with LGPL-2.1
const compatibleLicenses = ['lgpl-2.1', 'gpl-2.0', 'gpl-3.0', 'lgpl-3.0'];

// Function to fetch the LICENSE file or README file from the repository
async function getRepoLicense(owner: string, repo: string) {
  try {
    // 1. Check for LICENSE file in the root directory
    const licenseFileUrl = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents/LICENSE`;
    const response = await axios.get(licenseFileUrl, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // GitHub API token from .env file
      },
    });

    // Decode the LICENSE file content
    const licenseContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
// Check if the license contains relevant GPL versions
if (licenseContent.includes('GNU GENERAL PUBLIC LICENSE')) {
  if (licenseContent.includes('Version 2')) {
    //Detected GPL-2.0
    return 'gpl-2.0';
  } else if (licenseContent.includes('Version 3')) {
    //Detected GPL-3.0
    return 'gpl-3.0';
  }
}
if (licenseContent.includes('GNU LESSER GENERAL PUBLIC LICENSE')) {
  if (licenseContent.includes('Version 2.1')) {
    //Detected LGPL-2.0
    return 'lgpl-2.1';
  } else if (licenseContent.includes('Version 3')) {
    //Detected LGPL-3.0
    return 'lgpl-3.0';
  }
}
// If the content does not match any relevant GPL version, continue to README check
return null;

} catch (error) {
//console.log('LICENSE file not found or could not be processed, checking README for license section...');
return await getLicenseFromReadme(owner, repo);
}
}

// Function to fetch license section from README file
async function getLicenseFromReadme(owner: string, repo: string) {
  try {
    const readmeUrl = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents/README.md`;
    const response = await axios.get(readmeUrl, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    });

    // Decode README content
    const readmeContent = Buffer.from(response.data.content, 'base64').toString('utf-8');

    // Extract license section from README (simple regex to look for "License" heading)
    const licenseSection = readmeContent.match(/##?\s*License[\s\S]*?\n(.*)/i);

    if (licenseSection && licenseSection[1]) {
      return licenseSection[1].trim();
    } else {
      //No license section found in README.
      return;
    }
  } catch (error) {
    //Run into an error then 
    return 0;
  }
}

// Function to check if the repository license is compatible with LGPL-2.1
 export async function checkLicenseCompatibility(owner: string, repo: string) {
  const licenseContent = await getRepoLicense(owner, repo);

  if (!licenseContent) {
    //License information could not be retrieved
    return 0;
  }

  // Check if the license content contains any compatible license keywords
  const isCompatible = compatibleLicenses.some(license => 
    licenseContent.toLowerCase().includes(license)
  );
  if (isCompatible) {
    //Debug Output
    //The license is compatible with LGPL-2.1 so return 1
    return 1;
  } else {
    //Debug Output
    //The license is NOT compatible with LGPL-2.1 so return 0
    return 0;
  }
}


