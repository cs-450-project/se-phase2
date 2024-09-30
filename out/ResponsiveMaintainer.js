"use strict";
/*
 * Correctness.ts
 *
 * Description:
 * This file uses the GitHubAPI to find the maintainers and how quickly they respond to issues
 *
 * Author: Brayden Devenport
 * Date: 9-29-2024
 * Version: 1.0
 *
 */
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
exports.calculateResponsiveMaintainer = calculateResponsiveMaintainer;
//Promised-based HTTP client to make requests to the GitHub API
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const Logger_1 = __importDefault(require("./Logger"));
//loads environment variables GITHUB_TOKEN from .env file
dotenv_1.default.config();
//Retrieves Github Token form .env (environment variable file)
const token = process.env.GITHUB_TOKEN;
const GITHUB_API_BASE_URL = 'https://api.github.com';
// GitHub allows a maximum of 100 items per page
const ITEMS_PER_PAGE = 100;
// Helper function to get the "next" URL from the pagination link header
function getNextPage(linkHeader) {
    if (!linkHeader)
        return null;
    const links = linkHeader.split(',').map(part => part.trim());
    const nextLink = links.find(link => link.includes('rel="next"'));
    if (!nextLink)
        return null;
    const nextUrlMatch = nextLink.match(/<([^>]+)>/);
    return nextUrlMatch ? nextUrlMatch[1] : null;
}
// Function to fetch all paginated data from the GitHub API
function fetchPaginatedData(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let results = [];
        let nextPageUrl = `${url}&per_page=${ITEMS_PER_PAGE}`;
        while (nextPageUrl) {
            try {
                const response = yield axios_1.default.get(nextPageUrl, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                results = results.concat(response.data);
                // Check for the "Link" header to see if there's a next page
                nextPageUrl = getNextPage(response.headers.link || null);
            }
            catch (error) {
                Logger_1.default.info('Unable to fetch data');
                Logger_1.default.info(error);
                return results; // Return what we have in case of failure
            }
        }
        return results;
    });
}
// Function to fetch all pull requests (PRs) with pagination
function getPullRequests(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/pulls?state=all`;
        return yield fetchPaginatedData(url);
    });
}
// Function to fetch all issues with pagination
function getIssues(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/issues?state=open`;
        return yield fetchPaginatedData(url);
    });
}
// Helper function to calculate the days difference between two dates
function calculateDaysDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const differenceInTime = d2.getTime() - d1.getTime();
    return Math.floor(differenceInTime / (1000 * 3600 * 24)); // Convert milliseconds to days
}
// Main function to calculate the "Responsive Maintainer" metric
function calculateResponsiveMaintainer(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        // Fetch pull requests and issues
        const pullRequests = yield getPullRequests(owner, repo);
        const issues = yield getIssues(owner, repo);
        if (!pullRequests || !issues) {
            return;
        }
        // 1. Check when the last update was made (Pull Requests)
        const lastPR = pullRequests[0]; // The most recent pull request
        const lastPRUpdateDate = lastPR ? lastPR.updated_at : null;
        const lastPRClosedDate = lastPR ? lastPR.closed_at : null;
        const daysSinceLastUpdate = lastPRUpdateDate
            ? calculateDaysDifference(lastPRUpdateDate, new Date().toISOString())
            : null;
        // 2. Check if there are any issues still open and how long they've been open
        const openIssuesCount = issues.length;
        const issueDurations = issues.map((issue) => {
            return calculateDaysDifference(issue.created_at, new Date().toISOString());
        });
        const averageIssueDuration = issueDurations.reduce((sum, duration) => sum + duration, 0) /
            (issueDurations.length || 1);
        // Output results
        //console.log(`--- Responsive Maintainer Metrics for ${owner}/${repo} ---`);
        //if (lastPRUpdateDate) {
        //  console.log(`Last Pull Request Updated: ${lastPRUpdateDate}`);
        //  console.log(
        //    `Days Since Last Update: ${
        //      daysSinceLastUpdate !== null ? daysSinceLastUpdate : 'N/A'
        //    }`
        //  );
        //}
        //console.log(`Open Issues: ${openIssuesCount}`);
        //Only ouput we care about is the average issue open duration. 
        return averageIssueDuration;
        //console.log('--- End of Report ---');
    });
}
// Example usage
// calculateResponsiveMaintainer('facebook', 'react');
//# sourceMappingURL=ResponsiveMaintainer.js.map