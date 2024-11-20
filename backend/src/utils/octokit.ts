import { Octokit } from '@octokit/rest';

// Function to get the Octokit instance
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

export default octokit;