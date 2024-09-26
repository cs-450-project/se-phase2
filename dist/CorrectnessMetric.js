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
exports.evaluateCorrectness = evaluateCorrectness;
//Promised-based HTTP client to make requests to the GitHub API
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
//loads environment variables GITHUB_TOKEN from .env file
dotenv_1.default.config();
//Retrieves Github Token form .env (environment variable file)
const token = process.env.GITHUB_TOKEN;
const GITHUB_API_BASE_URL = 'https://api.github.com';
function getTestCoverageReport(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Search for test coverage report files in the repository
            const response = yield axios_1.default.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents`, // This fetches the contents of the repo
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Look for a coverage file (e.g., coverage.json or coverage.xml)
            const files = response.data;
            //Looks for any files names that have coverage in them
            const coverageFile = files.find((file) => file.name.includes('coverage'));
            //If there is no converage file
            if (!coverageFile) {
                console.log('No coverage report found in the repository.');
                return null;
            }
            // Fetch the contents of the coverage file
            const coverageResponse = yield axios_1.default.get(coverageFile.download_url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return coverageResponse.data; // Return the content of the coverage report
        }
        catch (error) {
            console.error(`Error fetching coverage report: ${error}`);
            return null;
        }
    });
}
//Function that calculates the score
function calculateCorrectness(coverageReport) {
    const { totalTests, passedTests } = coverageReport;
    //If no test exsits 
    if (totalTests === 0) {
        console.log('No tests were run.');
        return 0;
    }
    //Calculation
    const passRate = (passedTests / totalTests) * 100;
    console.log(`Test Pass Rate: ${passRate.toFixed(2)}%`);
    return passRate;
}
// Main function to evaluate correctness of a repository
function evaluateCorrectness(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const coverageReport = yield getTestCoverageReport(owner, repo);
        if (!coverageReport) {
            console.log('No coverage report found, cannot calculate correctness.');
            return;
        }
        // Assuming the report has totalTests and passedTests fields
        calculateCorrectness({
            totalTests: coverageReport.totalTests,
            passedTests: coverageReport.passedTests,
        });
    });
}
// Example usage (replace with your GitHub owner and repo)
//evaluateCorrectness('gcovr', 'gcovr');
//# sourceMappingURL=CorrectnessMetric.js.map