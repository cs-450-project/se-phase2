
import AdmZip from "adm-zip";
import { ApiError } from "./errors/ApiError.js";


export function getPackageJsonFromContentBuffer(contentBuffer: string): string {
    try {
        // Decode the base64 encoded zip file to binary buffer
        const zipBuffer = Buffer.from(contentBuffer, 'base64');

        // Load buffer as zip file and extract package.json
        const zip = new AdmZip(zipBuffer);
        const zipEntries = zip.getEntries();
        const targetEntry = zipEntries.find(entry => entry.entryName.endsWith('package.json'));
        
        if (!targetEntry) {
            throw new ApiError('Package.json not found.', 400);
        }

        // Parse package.json file
        const fileData = targetEntry.getData();
        const packageJson = fileData.toString('utf8');

        return packageJson;

    } catch (error) {
        console.error('[PackageUploadService] An error occurred while extracting the package.json from the zip content.', error);
        throw new ApiError("Failed to extract package.json from zip content.", 400);
    }
}

export function extractNameAndVersionFromPackageJson(packageJson: string) {

    const packageData = JSON.parse(packageJson);

    const Name = packageData.name;
    const Version = packageData.version

    if (!Name || !Version) {
        throw new ApiError('Name or version not found in package.json.', 400);
    }

    return { Name, Version };
}

export function extractGitHubAttributesFromGitHubURL(urlRepo: string): { owner: string, repo: string } {
    var owner = urlRepo.split('/')[3].trim();
    var repo = urlRepo.split('/')[4].trim();

    if (repo.includes('.git')) {
        repo = repo.replace('.git', '');
    }

    console.log(`Owner: ${owner}`);
    console.log(`Repo: ${repo}`);

    return { owner, repo };
}


    // Fetch GitHub repository URL from npm API
export async function getNpmRepoURLFromGitHubURL(url: string): Promise<string> {
    const npmApiUrl = url.replace(/(?<=\/)www(?=\.)/, 'replicate').replace('/package', '');
    console.log(`Fetching repository URL from npm API: ${npmApiUrl}`);
    const npmApiResponse = await fetch(npmApiUrl);
    const npmApiData = await npmApiResponse.json();

    if (!npmApiData.repository || !npmApiData.repository.url) {
        console.log(`Repository URL not found in npm package data for URL: ${url}`);
        throw new ApiError('Repository URL not found in npm package data', 400);
    }

    const npmRepoUrl = npmApiData.repository.url;
    console.log(`NPM Repository URL: ${npmRepoUrl}`);
    return npmRepoUrl;
} // end getNpmRepoURL
