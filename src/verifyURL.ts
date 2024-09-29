import axios from 'axios';

async function isPackageOnGitHub(packageName: string) {
    try {
        // Fetch package data from npm registry
        const response = await axios.get(`https://registry.npmjs.org/${packageName}`);

        // Get the repository field
        const repository = response.data.repository;

        // Check if the repository field exists and points to GitHub
        if (repository && typeof repository === 'object' && repository.url) {
            const repoUrl = repository.url;


            if (repoUrl.includes('github.com')) {

                return repoUrl;

            }//end if statement

        }
        else {

            console.log(`No repository information found for package: ${packageName}`);
            return null;


        }
    } catch (error) {
        console.error(`Failed to fetch package information for ${packageName}:`, error);
        return null;

    }
}
