"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPackageOnGitHub = isPackageOnGitHub;
const axios_1 = __importDefault(require("axios"));
function isPackageOnGitHub(packageName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //Extract package name from URL
            const regex = /npmjs\.com\/package\/([^\/]+)/;
            const match = packageName.match(regex);
            if (match && match[1]) {
                packageName = match[1];
            } //end if statement
            // Fetch package data from npm registry
            const response = yield axios_1.default.get(`https://registry.npmjs.org/${packageName}`);
            // Check if the repository field exists and points to GitHub
            const repository = response.data.repository;
            // If the repository is an object, use its URL
            if (repository) {
                let repoUrl = null;
                // Check if the repository is a string
                if (typeof repository === 'string') {
                    repoUrl = repository;
                }
                else if (typeof repository === 'object' && repository.url) {
                    repoUrl = repository.url;
                }
                // Ensure the URL is in HTTP format
                if (repoUrl && repoUrl.includes('github.com')) {
                    // Convert SSH URL or other formats to HTTPS format
                    if (repoUrl.startsWith('git+ssh://')) {
                        repoUrl = repoUrl.replace('git+ssh://', 'https://').replace('git@', '').replace('.git', '');
                    }
                    else if (repoUrl.startsWith('git@')) {
                        repoUrl = repoUrl.replace('git@', 'https://').replace(':', '/').replace('.git', '');
                    }
                    else if (repoUrl.startsWith('git+')) {
                        repoUrl = repoUrl.replace('git+', "");
                    }
                    else if (repoUrl.startsWith("https://git+")) {
                        // Replace with "https://"
                        repoUrl = repoUrl.replace("https://git+", "");
                    }
                    else if (!repoUrl.startsWith('http://') && !repoUrl.startsWith('https://')) {
                        repoUrl = `https://${repoUrl}`; // Handle any other cases
                    }
                    if (repoUrl.endsWith(".git")) {
                        repoUrl = repoUrl.replace(".git", "");
                    }
                    return repoUrl; // Return the formatted URL
                }
            }
            console.log("No GitHub repository found for package.");
            return null; // Return null if no repository URL is found
        }
        catch (error) {
            console.log(`Failed to fetch package information for ${packageName}`);
            return null; // Return null in case of error
        }
    });
}
//# sourceMappingURL=verifyURL.js.map