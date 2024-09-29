"use strict";
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
const simple_git_1 = __importDefault(require("simple-git"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Initialize simple-git
const git = (0, simple_git_1.default)();
// Repository URL
const repoUrl = 'https://github.com/lkurker/TestRepository';
//We will now clone the repository to the directory of wherever the user is currently located
const currentDir = process.cwd();
const newDir = "testingRepo";
//Concatinate the two strings to get the new directory for the repo to clone to
const newDirectory = currentDir.concat("/", newDir);
//Variable that will keep track of how good the ramp-up score is
var rampScore = 0;
//String that will hold the content of the README file
var readmeContent = "";
function cloneRepository() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Attempting to clone repository...");
            yield git.clone(repoUrl, newDirectory);
            console.log("Repository successfully cloned!!!!");
        } //end try statement
        catch (error) {
            //In case the repository fails to clone
            console.error('Failed to clone repository :(');
        } //end catch statement
    });
} //end cloneRepository function
//Now we will go through the cloned repository and list all the files in it
function checkFiles(directory) {
    return __awaiter(this, void 0, void 0, function* () {
        //Get all the files in the directory
        const dirFiles = fs.readdirSync(directory);
        //List all of the files that are in the directory
        console.log("Files in the directory: ", dirFiles);
        console.log(dirFiles.length);
        //Check if the files in the directory match the files that we want to check
        for (let i = 0; i < dirFiles.length; i++) {
            if (dirFiles[i] == "README.md") {
                //add the content of the README file to the readmeContent variable, which will be used to check the ramp-up score
                readmeContent = fs.readFileSync(path.join(directory, dirFiles[i]), 'utf-8');
                break;
            } //end if statement
            else {
                console.log("The current file we're looking at isn't what we need. Moving on to the next file...");
            }
        } //end for loop
        console.log("testing");
    });
} //end checkFiles function
function analyzeReadme(readmeContent) {
    return __awaiter(this, void 0, void 0, function* () {
        //Checking to see which sections are contained in the README file
        if (readmeContent.includes("## Introduction") || readmeContent.includes("## Getting Started")) {
            rampScore += 10;
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
//cloneRepository();
//checkFiles(newDirectory);
//Now we will analyze the README file to determine the ramp-up score
////analyzeReadme(readmeContent);
//console.log(rampScore);
//# sourceMappingURL=repoClone.js.map