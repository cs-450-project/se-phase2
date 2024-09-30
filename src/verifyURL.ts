/*
 * VerifyURL.ts
 * 
 * Description:
 * This file will take a NPMJS link, and find a github repo link to return. If it does not find one, then it returns null
 * 
 * Author: Jacob Esparza
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */

import axios from 'axios';

export async function isPackageOnGitHub(packageName: string): Promise<string | null> {
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
        return null; // Return null in case of error
    }
}


