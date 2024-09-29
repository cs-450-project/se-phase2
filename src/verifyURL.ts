import axios from 'axios';

export async function isPackageOnGitHub(packageName: string): Promise<string | null> {
    try {
        // Fetch package data from npm registry
        const response = await axios.get(packageName);

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
                } else if (!repoUrl.startsWith('http://') && !repoUrl.startsWith('https://')) {
                    repoUrl = `https://${repoUrl}`; // Handle any other cases
                }

                return repoUrl; // Return the formatted URL

            }//end if statement
        }

        console.log("No GitHub repository found for package.");
        return null; // Return null if no repository URL is found

    } catch (error) {
        console.error(`Failed to fetch package information for ${packageName}`, error);
        return null; // Return null in case of error
    }
}

