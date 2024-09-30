"use strict";
/*
 * Correctness.ts
 *
 * Description:
 * Clones the repo provided and then calculates the RampUp based on that repo.
 * It will first check to see if the directory exists, and if it does, it will delete the contents and then clone the repo again.
 * This is to ensure that the correct repository is cloned and that the ramp-up score is accurate.
 * To calculate the ramp-up score, the program will check the README file for certain sections. If the sections are present, the score will increase.
 *
 * Author: Logan Kurker
 * Date: 9-29-2024
 * Version: 1.0
 *
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.cloneRepository = cloneRepository;
const simple_git_1 = __importDefault(require("simple-git"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Initialize simple-git
const git = (0, simple_git_1.default)();
//We will now clone the repository to the directory of wherever the user is currently located
const currentDir = process.cwd();
const newDir = "testingRepo";
//Concatinate the two strings to get the new directory for the repo to clone to
const newDirectory = currentDir.concat("/", newDir);
//Variable that will keep track of how good the ramp-up score is
var rampScore = 0;
//String that will hold the content of the README file
var readmeContent = "";
function cloneRepository(repoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //Only clone if the directory does not exist
            if (!fs.existsSync(newDirectory)) {
                yield git.clone(repoUrl, newDirectory);
            } //end if statement
            //If the directory already exists, delete the contents and then clone again
            else {
                const files = yield fs.readdirSync(newDirectory);
                //Delete all of the files in the directory
                for (const file of files) {
                    const filePath = path.join(newDirectory, file);
                    yield fs.unlinkSync(filePath);
                } //end for loop
                yield fs.rmdirSync(newDirectory);
                yield git.clone(repoUrl, newDirectory);
            } //end else statement
            yield checkFiles(newDirectory);
            analyzeReadme(readmeContent);
            return rampScore;
        } //end try statement
        catch (error) {
            //In case the repository fails to clone
            return -1;
        } //end catch statement
    });
} //end cloneRepository function
//Now we will go through the cloned repository and list all the files in it
function checkFiles(directory) {
    return __awaiter(this, void 0, void 0, function* () {
        //Get all the files in the directory
        const dirFiles = fs.readdirSync(directory);
        //Check if the files in the directory match the files that we want to check
        for (let i = 0; i < dirFiles.length; i++) {
            if (dirFiles[i] == "README.md") {
                //add the content of the README file to the readmeContent variable, which will be used to check the ramp-up score
                readmeContent = fs.readFileSync(path.join(directory, dirFiles[i]), 'utf-8');
                break;
            } //end if statement
        } //end for loop
    });
} //end checkFiles function
function analyzeReadme(readmeContent) {
    return __awaiter(this, void 0, void 0, function* () {
        //Checking to see which sections are contained in the README file
        if (readmeContent.includes("## Introduction") || readmeContent.includes("## Getting Started") || readmeContent.includes("## introduction")) {
            rampScore += 10;
        } //end if statement
        if (readmeContent.includes("## Installation") || readmeContent.includes("## Installation Instructions") || readmeContent.includes("## installation") || readmeContent.includes("## install") || readmeContent.includes("## Install")) {
            rampScore += 10;
        } //end if statement
        if (readmeContent.includes("## Usage") || readmeContent.includes("## usage")) {
            rampScore += 10;
        } //end if statement
        if (readmeContent.includes("## Contact Information")) {
            rampScore += 10;
        } //end if statement
        if (readmeContent.includes("## Configuration") || readmeContent.includes("## configuration")) {
            rampScore += 10;
        } //end if statement"
    });
} //end analyzeReadme function
//# sourceMappingURL=RepoClone.js.map