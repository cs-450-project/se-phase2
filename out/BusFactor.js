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
/*
 * BusFactor.ts
 *
 * Description:
 * This file uses the GitHubAPI to calculate the BusFactor.
 * The BusFactor calulation is made by going to the commits made in the repository seeing how manyy comtis have happend in the last year.
 * Then looks at those commits made and counts how many people worked from the past year.
 * It will output how many people have worked on it in a years time.
 * If there are more than 16 people who have worked on it then just output the 16.
 *
 *
 * Author: Brayden Devenport
 * Date: 9-29-2024
 * Version: 1.0
 *
 */
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const dayjs_1 = __importDefault(require("dayjs"));
const Logger_1 = __importDefault(require("./Logger"));
// Loads environment variables (GITHUB_TOKEN) from .env file
dotenv_1.default.config();
// Retrieves GitHub Token from .env file
const token = process.env.GITHUB_TOKEN;
const GITHUB_API_BASE_URL = 'https://api.github.com';
const ONE_YEAR_AGO = (0, dayjs_1.default)().subtract(1, 'year').toISOString();
// Cap for maximum contributors
const CONTRIBUTOR_CAP = 16;
// Fetches the list of commits from a GitHub repository in the last year
function getCommits(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const contributors = new Set();
            let page = 1;
            // Fetch commits page by page (100 commits per page)
            while (true) {
                const response = yield axios_1.default.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/commits`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        per_page: 100,
                        page: page,
                        since: ONE_YEAR_AGO,
                    },
                });
                const commits = response.data;
                // If no more commits, break the loop
                if (commits.length === 0)
                    break;
                // Collect contributors from each commit
                commits.forEach((commit) => {
                    if (commit.author && commit.author.login) {
                        contributors.add(commit.author.login);
                    }
                });
                // Stop if we've reached the contributor cap
                if (contributors.size >= CONTRIBUTOR_CAP)
                    break;
                page++; // Move to the next page
            }
            return contributors;
        }
        catch (error) {
            //Error fetching commits
            Logger_1.default.info('Unable to fetch commits');
            Logger_1.default.info(error);
            return null;
        }
    });
}
// Calculates the Bus Factor based on the number of contributors
function calculateBusFactor(contributors) {
    return Math.min(contributors.size, CONTRIBUTOR_CAP);
}
// Main function to calculate the Bus Factor of a GitHub repository
function getBusFactor(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const contributors = yield getCommits(owner, repo);
        if (!contributors) {
            // Failed to retrieve contributors
            return 0;
        }
        // Calculate Bus Factor
        const busFactor = calculateBusFactor(contributors);
        // Output the result
        return busFactor;
    });
}
//# sourceMappingURL=BusFactor.js.map