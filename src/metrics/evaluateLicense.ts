/**
 * Author: JT Wellspring
 * Date: 10-21-2024
 * Version: 1.0
 */

import * as dotenv from 'dotenv';
import logger from '../utils/logger.js';
import octokit from '../utils/octokit.js';

dotenv.config();

// Variable that will keep track of the license score
var licenseScore: number = 0;

export async function evaluateLicense(owner: string, repo: string) {
    logger.info(`Starting license evaluation for ${owner}/${repo}`);
    licenseScore = 0;

    await analyzeLicense(owner, repo);

    logger.info(`Completed license evaluation for ${owner}/${repo} with score: ${licenseScore}`);
    return licenseScore;
}

// Function that will analyze the license of the repository
async function analyzeLicense(owner: string, repo: string) {
    try {
        logger.debug(`Analyzing license for ${owner}/${repo}`);
        const licenseKey = await getRepoLicense(owner, repo);

        if (licenseKey && approvedLicensesIdentifiers.includes(licenseKey)) {
            licenseScore = 1;
            logger.info(`License ${licenseKey} is approved for ${owner}/${repo}`);
        } else {
            logger.info(`License ${licenseKey} is not approved for ${owner}/${repo}`);
        }
    } catch (error) {
        logger.error('Error analyzing license:', error);
    }
}

// Function that will get the license information from the repository
async function getRepoLicense(owner: string, repo: string): Promise<string | null> {
    try {
        logger.debug(`Fetching license information for ${owner}/${repo}`);
        const { data } = await octokit.repos.get({ owner, repo });

        if (data.license && data.license.spdx_id) {
            logger.debug(`Found license ${data.license.spdx_id} for ${owner}/${repo}`);
            return data.license.spdx_id;
        }

        const readmeContent = await getReadme(owner, repo);
        return checkLicenseInReadme(readmeContent);
    } catch (error) {
        logger.error('Error fetching license information:', error);
        return null;
    }
}

// Function that will get the README file from the repository
async function getReadme(owner: string, repo: string): Promise<string> {
    try {
        logger.debug(`Fetching README content for ${owner}/${repo}`);
        const readmeData = await octokit.repos.getReadme({ owner, repo });
        return Buffer.from(readmeData.data.content, 'base64').toString('utf-8');
    } catch (error) {
        logger.error('Error fetching README content:', error);
        throw error;
    }
}

// Function that will check for approved licenses in the README content
function checkLicenseInReadme(content: string): string | null {
    logger.debug('Checking for approved licenses in README content');
    for (const license of approvedLicensesNames) {
        if (content.includes(license)) {
            logger.debug(`Found approved license ${license} in README content`);
            return license;
        }
    }
    logger.debug('No approved licenses found in README content');
    return null;
}

// Approved licenses
const approvedLicensesIdentifiers: string[] = ['MIT', 'LGPL', 'Apache-1.0', 'Apache-1.1'];
const approvedLicensesNames: string[] = ['MIT', 'GNU Lesser General Public License', 'Apache License 1.0', 'Apache License 1.1'];