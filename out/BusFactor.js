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
exports.getBusFactor = getBusFactor;
//Promised-based HTTP client to make requests to the GitHub API
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
//loads environment variables GITHUB_TOKEN from .env file
dotenv_1.default.config();
//Retrieves Github Token form .env (environment variable file)
const token = process.env.GITHUB_TOKEN;
const GITHUB_API_BASE_URL = 'https://api.github.com';
// Function to fetch commits and map developers to modules (files/directories)
function getCommits(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Send GET request to fetch commits (100 commits per page)
            const response = yield axios_1.default.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/commits?per_page=100`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Extract commits data
            const commits = response.data;
            // Dictionary to map modules (files/directories) to developers
            const moduleDeveloperMap = {};
            // Process each commit to map developers to the files they've worked on
            for (const commit of commits) {
                const author = commit.commit.author.name;
                const commitUrl = commit.url;
                // Fetch the specific commit data to get the list of modified files
                const commitDetails = yield axios_1.default.get(commitUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const filesChanged = commitDetails.data.files;
                // Map the developer to each file/module they've worked on
                filesChanged.forEach((file) => {
                    const module = file.filename.split('/')[0]; // First part of the file path, treat it as a module
                    if (!moduleDeveloperMap[module]) {
                        moduleDeveloperMap[module] = new Set();
                    }
                    moduleDeveloperMap[module].add(author);
                });
            }
            return moduleDeveloperMap;
        }
        catch (error) {
            console.error(`Error fetching commits: ${error}`);
            return null;
        }
    });
}
// Function to calculate the Bus Factor based on module-developer mapping
function calculateBusFactor(moduleDeveloperMap) {
    let busFactor = 0;
    // Iterate over each module and count unique developers
    for (const module in moduleDeveloperMap) {
        const developers = moduleDeveloperMap[module];
        // If only one developer is working on a module, increase the Bus Factor
        if (developers.size === 1) {
            busFactor++;
        }
    }
    return busFactor;
}
// Main function to calculate Bus Factor
function getBusFactor(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const moduleDeveloperMap = yield getCommits(owner, repo);
        if (!moduleDeveloperMap) {
            console.log('Failed to retrieve module-developer mapping.');
            return 0;
        }
        // Calculate the Bus Factor based on non-overlapping developer work
        const busFactor = calculateBusFactor(moduleDeveloperMap);
        return busFactor;
    });
}
//getBusFactor('facebook', 'react');
//# sourceMappingURL=BusFactor.js.map