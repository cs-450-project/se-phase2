/*
 * VerifyURL.ts
 * 
 * Description:
 * This file will take a NPMJS link, and find a github repo link to return. If it does not find one, then it returns null
 * It does this by first taking in an entire npm URL. It will extract the package name from said URL, and concatenate it to the npm registry URL.
 * Once this has been done, the file will fetch the package data from the npm registry.
 *  It will then check if the repository field exists and points to GitHub.
 * If it exists, it will get the repository URL and convert it to HTTPS format.
 * Finally, the system will return the formatted URL for use in the rest of the program.
 * 
 * Author: Logan Kurker
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */

import axios from 'axios';
import logger from '../utils/Logger';

export async function findGitHubRepoForNPMLink(packageName: string): Promise<string | null> {
    try {

        //Extract package name from URL
        const regex = /npmjs\.com\/package\/([^\/]+)/;
        const match = packageName.match(regex);

        if (match && match[1]) {
            
            packageName = match[1];
            
        }//end if statement

        // Fetch package data from npm registry
        const response = await axios.get(`https://registry.npmjs.org/${packageName}`);

        // Check if the repository field exists and points to GitHub
        const repository = response.data.repository;

        // If the repository is an object, use its URL
        if (repository) {
            let repoUrl: string | null = null;

            // Check if the repository is a string
            if (typeof repository === 'string') {
                repoUrl = repository;
            } else if (typeof repository === 'object' && repository.url) {
                repoUrl = repository.url;
            }

            // Ensure the URL is in HTTP format
            if (repoUrl && repoUrl.includes('github.com')) {
                // Convert SSH URL or other formats to HTTPS format
                if (repoUrl.startsWith('git+ssh://')) {
                    repoUrl = repoUrl.replace('git+ssh://', 'https://').replace('git@', '').replace('.git', '');
                } else if (repoUrl.startsWith('git@')) {
                    repoUrl = repoUrl.replace('git@', 'https://').replace(':', '/').replace('.git', '');
                } else if(repoUrl.startsWith('git+')){
                    repoUrl = repoUrl.replace('git+', "");
                }
                else if (repoUrl.startsWith("https://git+")) {
                    // Replace with "https://"
                    repoUrl = repoUrl.replace("https://git+", "");
                }
                else if (!repoUrl.startsWith('http://') && !repoUrl.startsWith('https://')) {
                    repoUrl = `https://${repoUrl}`; // Handle any other cases
                } 

                if(repoUrl.endsWith(".git")){
                    repoUrl = repoUrl.replace(".git", "")
                }

                return repoUrl; // Return the formatted URL
            }
        }

        return null; // Return null if no repository URL is found

    } catch (error) {
        logger.info("Something went wrong connecting to the npmjs link " + packageName + " from VerifyURL");
        logger.info(error);
        return null; // Return null in case of error
    }
}


