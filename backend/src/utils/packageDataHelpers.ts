
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

// Extract Name and Version from package.json
export function extractNameAndVersionFromPackageJson(packageJson: string) {

    const packageData = JSON.parse(packageJson);

    const Name = packageData.name;
    const Version = packageData.version

    if (!Name || !Version) {
        throw new ApiError('Name or version not found in package.json.', 400);
    }

    return { Name, Version };
}

// Extract GitHub owner and repository name from package.json
export async function extractGitHubLinkFromPackageJson(packageJson: string): Promise<string> {
    
    try {
        const packageData = JSON.parse(packageJson);
        
        // Check repository field
        if (packageData.repository) {
          if (typeof packageData.repository === 'string') {
            if (packageData.repository.includes('github.com')) {
              return await normalizeToGithubUrl(packageData.repository);
            }
          } else if (packageData.repository.url && packageData.repository.url.includes('github.com')) {
            return await normalizeToGithubUrl(packageData.repository.url);
          }
        }
        
        // Check homepage field
        if (packageData.homepage && packageData.homepage.includes('github.com')) {
          return await normalizeToGithubUrl(packageData.homepage);
        }
        
        // Check bugs field
        if (packageData.bugs) {
          const bugsUrl = typeof packageData.bugs === 'string' 
            ? packageData.bugs 
            : packageData.bugs.url;
            
          if (bugsUrl && bugsUrl.includes('github.com')) {
            return await normalizeToGithubUrl(bugsUrl);
          }
        }

        throw new ApiError('GitHub repository URL not found in package.json.', 400);

      } catch (error) {
        throw new ApiError('Failed to extract GitHub attributes from package.json.', 400);
      }
}

export async function normalizeToGithubUrl(url: string): Promise<string> {
    
    console.log('Original URL:', url);

    // Handle npm URLs first
    if (url.includes('npmjs.com/package/')) {
        url = await getNpmRepoURLFromGitHubURL(url);
        console.log('Converted NPM URL:', url);
    }

    // Validate GitHub URL
    if (!url.includes('github.com')) {
        throw new ApiError('Unable to process URL: Not a GitHub URL', 400);
    }

    // Step 1: Strip all protocols and prefixes
    let normalized = url
        .replace(/^(git\+https?:\/\/|git:|https?:\/\/)/, '')  // Remove all protocol variants
        .replace(/^github.com:/, '');  // Remove SSH format

    // Step 2: Remove .git suffix
    normalized = normalized.replace(/\.git$/, '');

    // Step 3: Ensure URL starts with github.com/
    if (!normalized.startsWith('github.com/')) {
        normalized = `github.com/${normalized.replace(/^github.com/, '')}`;
    }

    // Step 4: Add https protocol
    normalized = `https://${normalized}`;

    console.log('Normalized URL:', normalized);
    return normalized;
  }

// Extract owner and repository name from GitHub URL
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
