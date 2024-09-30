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
exports.calculateCorrectnessScore = calculateCorrectnessScore;
/*
 * CorrectnessMetric.ts
 *
 * Description:
 * This file uses the GitHubAPI to calculate the CorrectnessMetric
 * We have a score the max value is 100 and we check to see if there is a README file, test files, and how many contributors are in the repostitory.
 * We score that if there is a README file then we add 20 to the score. And if there are test files then we add 50 to the score.
 * We also add to the score how many contributors there are in the repository with a cap of 30.
 *
 * Author: Brayden Devenport
 * Date: 9-29-2024
 * Version: 1.0
 *
 */
//Promised-based HTTP client to make requests to the GitHub API
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const Logger_1 = __importDefault(require("./Logger"));
//loads environment variables GITHUB_TOKEN from .env file
dotenv_1.default.config();
//Retrieves Github Token form .env (environment variable file)
const token = process.env.GITHUB_TOKEN;
const GITHUB_API_BASE_URL = 'https://api.github.com';
// Helper function to check if a file exists in the repository
function fileExists(owner, repo, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents/${filePath}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.status === 200;
        }
        catch (error) {
            Logger_1.default.info('Something went wrong with connecting to the github api from Correctness');
            Logger_1.default.info(error);
            return false;
        }
    });
}
// Function to get the number of contributors in the repo
function getContributorsCount(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contributors`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.length;
        }
        catch (error) {
            Logger_1.default.info('Something went wrong with connecting to the github api from Correctness');
            Logger_1.default.info(error);
            return 0;
        }
    });
}
// Function to calculate correctness score based on contributors, README, and test files
function calculateCorrectnessScore(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let score = 0;
        // 1. Check number of contributors
        const contributorsCount = yield getContributorsCount(owner, repo);
        const contributorScore = Math.min(contributorsCount, 30); // Cap the score at 30
        score += contributorScore;
        // 2. Check if README file exists
        const readmeExists = yield fileExists(owner, repo, 'README.md');
        if (readmeExists) {
            score += 20;
        }
        // 3. Check if test case files exist
        const testFiles = ["test", "tests", "spec"]; // common test directories
        for (const file of testFiles) {
            const testFileExists = yield fileExists(owner, repo, file);
            if (testFileExists) {
                score += 50;
                break; // Stop once we find any test file
            }
        }
        //Correctness Score
        return score;
    });
}
//# sourceMappingURL=CorrectnessMetric.js.map