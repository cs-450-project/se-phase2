"use strict";
//Calculations of the Rampup metric will be done here by utilising the Github API
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
//Ensure that we have the required libraries
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
//Variable that will keep track of how good the ramp-up score is
var rampScore = 0;
//load the environment variables
dotenv_1.default.config();
//Get the environment variables as a constant
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
//Throw an error if the token is not found
if (!GITHUB_TOKEN) {
    throw new Error("Github Token not found in environment variables.");
} //end if statement
//Function that will get the README file from the repository
function getReadme() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //Get the README file from the repository
            const response = yield axios_1.default.get('https://api.github.com/repos/lkurker/TestRepository/readme', {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`
                } //end headers
            }); //end axios.get
            //Return the content of the README file
            return response.data.content;
        } //end try statement
        catch (error) {
            console.error('Failed to get README file :(');
        } //end catch statement
    });
} //end getReadme function
function analyzeReadme(readmeContent) {
    return __awaiter(this, void 0, void 0, function* () {
        //Checking to see which sections are contained in the README file
        if (readmeContent.includes("## Introduction") || readmeContent.includes("## Getting Started")) {
            rampScore += 10;
            console.log("Testing");
        } //end if statement
        if (readmeContent.includes("## Installation") || readmeContent.includes("## Installation Instructions")) {
            rampScore += 10;
        } //end if statement
        if (readmeContent.includes("## Usage")) {
            rampScore += 10;
        } //end if statement
        if (readmeContent.includes("## Contact Information")) {
            rampScore += 10;
        } //end if statement
        if (readmeContent.includes("## Configuration")) {
            rampScore += 10;
        } //end if statement"
    });
} //end analyzeReadme function
//Analyze the content of the README file
function analyzeReadmeContent() {
    return __awaiter(this, void 0, void 0, function* () {
        //Get the content of the README file
        const readmeContent = yield getReadme();
        //now we need to decode the content of the README file
        const buff = Buffer.from(readmeContent, 'base64');
        const decodedReadmeContent = buff.toString('utf-8');
        //Analyze the content of the README file
        analyzeReadme(decodedReadmeContent);
    });
} //end analyzeReadmeContent function
function displayRampupScore() {
    return __awaiter(this, void 0, void 0, function* () {
        yield analyzeReadmeContent();
        console.log("Ramp-up score: ", rampScore);
    });
} //end displayRampupScore function
//displayRampupScore();
//# sourceMappingURL=RampUpMetric.js.map