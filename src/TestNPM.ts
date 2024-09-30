import {isPackageOnGitHub} from './verifyURL'

function GetRepoInfo(url: string): {owner: string; repo: string} | null{
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);

    if (match) {
        const owner = match[1];
        const repo = match[2];
        return { owner, repo };
    }
    return null; // Return null if the URL doesn't match
}

function isNpmLink(url: string): boolean {
    const npmRegex = /^(https?:\/\/(www\.)?npmjs\.com\/|npm:\/\/)/;
    return npmRegex.test(url);
}
async function Test(){
let url = "https://www.npmjs.com/package/browserify";
console.log(isNpmLink(url));

let repoInfo;

    if(isNpmLink(url)){
        console.log("Checking for NPM link");
        let newURL = await isPackageOnGitHub(url);
        if(newURL){
            url = newURL;
            console.log("Attempting to get GitHub Link")
            repoInfo = GetRepoInfo(url);
            
        }
        else{
            repoInfo = null;
        }
    }
    else{
        repoInfo = GetRepoInfo(url);
        
    }

    console.log(repoInfo);
}

Test();