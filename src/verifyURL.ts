﻿import axios from 'axios';

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

        console.log("No GitHub repository found for package.");
        return null; // Return null if no repository URL is found

    } catch (error) {
        console.log(`Failed to fetch package information for ${packageName}`);
        return null; // Return null in case of error
    }
}


