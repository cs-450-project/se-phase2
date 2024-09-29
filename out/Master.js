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
Object.defineProperty(exports, "__esModule", { value: true });
const TestParser_1 = require("./TestParser");
const TestOutput_1 = require("./TestOutput");
const TestRanker_1 = require("./TestRanker");
const Timer_1 = require("./Timer");
const BusFactor_1 = require("./BusFactor");
const ResponsiveMaintainer_1 = require("./ResponsiveMaintainer");
const CorrectnessMetric_1 = require("./CorrectnessMetric");
const LicenseMetric_1 = require("./LicenseMetric");
const RampUpMetric_1 = require("./RampUpMetric");
const verifyURL_1 = require("./verifyURL");
const repoClone_1 = require("./repoClone");
const fs = __importStar(require("fs"));
function GetRepoInfo(url) {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);
    if (match) {
        const owner = match[1];
        const repo = match[2];
        return { owner, repo };
    }
    return null; // Return null if the URL doesn't match
}
function isNpmLink(url) {
    const npmRegex = /^(https?:\/\/(www\.)?npmjs\.com\/|npm:\/\/)/;
    return npmRegex.test(url);
}
function ProcessURL(url, urlNum) {
    return __awaiter(this, void 0, void 0, function* () {
        const ranker = new TestRanker_1.Calculate();
        const totalTime = new Timer_1.Timer();
        const factorTime = new Timer_1.Timer();
        let repoInfo;
        console.log(urlNum);
        if (isNpmLink(url)) {
            console.log("Checking for NPM link");
            let newURL = yield (0, verifyURL_1.isPackageOnGitHub)(url);
            if (newURL) {
                url = newURL;
                repoInfo = GetRepoInfo(url);
            }
            else {
                repoInfo = null;
            }
        }
        else {
            repoInfo = GetRepoInfo(url);
        }
        if (repoInfo) {
            const { owner, repo } = repoInfo;
            if (owner && repo) {
                totalTime.StartTime();
                ranker.SetURL = url;
                factorTime.StartTime();
                //Check Bus Factor
                ranker.SetBusFactor = Number(yield (0, BusFactor_1.getBusFactor)(owner, repo));
                ranker.SetBusFactorLatency = factorTime.GetTime();
                factorTime.Reset();
                factorTime.StartTime();
                //Check Correctness
                ranker.SetCorrectness = Number(yield (0, CorrectnessMetric_1.evaluateCorrectness)(owner, repo));
                ranker.SetCorrectnessLatency = factorTime.GetTime();
                factorTime.Reset();
                factorTime.StartTime();
                //Check License
                ranker.SetLicense = Number(yield (0, LicenseMetric_1.checkLicenseCompatibility)(owner, repo));
                ranker.SetLicenseLatency = factorTime.GetTime();
                factorTime.Reset();
                factorTime.StartTime();
                if (urlNum > 1) {
                    console.log("Checking RampUp for URL: " + url);
                    //Check Rampup
                    ranker.SetRampUp = yield (0, RampUpMetric_1.displayRampupScore)(owner, repo);
                }
                else {
                    console.log("Cloning Repo from Master");
                    ranker.SetRampUp = yield (0, repoClone_1.cloneRepository)(url);
                }
                ranker.SetRampUpLatency = factorTime.GetTime();
                factorTime.Reset();
                factorTime.StartTime();
                //Check ResponsiveMaintainer
                ranker.SetResponsiveMaintainer = Number(yield (0, ResponsiveMaintainer_1.calculateResponsiveMaintainer)(owner, repo));
                ranker.SetResponsiveMaintainerLatency = factorTime.GetTime();
                factorTime.Reset();
                //Ends the NetScore timer and sends the time to the ranker
                ranker.SetNetScoreLatency = totalTime.GetTime();
                totalTime.Reset();
            }
            else {
                ranker.SetURL = url;
                console.log("Unable to connecto to repo, could not find the owner name and the repo name");
            }
        }
        else {
            ranker.SetURL = url;
            console.log("Unable to connecto to repo");
        }
        TestOutput_1.SendToOutput.writeToStdout({ URL: ranker.GetURL, NetScore: ranker.GetNetScore, NetScore_Latency: ranker.GetNetScoreLatency,
            RampUp: ranker.GetRampUp, RampUp_Latency: ranker.GetRampUpLatency, Correctness: ranker.GetCorrectness, Correctness_Latency: ranker.GetCorrectnessLatency,
            BusFactor: ranker.GetBusFactor, BusFactor_Latency: ranker.GetBusFactorLatency, ResponsiveMaintainer: ranker.GetResponsiveMaintainer, ResponsiveMaintainer_Latency: ranker.GetResponsiveMaintainerLatency,
            License: ranker.GetLicense, License_Latency: ranker.GetLicenseLatency });
        ranker.Clear();
    });
}
//Read Input
const fileLocation = process.argv[2]; //Gives argument three, which *should* be the file location
//Outputs file
fs.stat(fileLocation, (err, stats) => {
    if (err == null) {
        if (stats.isFile()) {
            const parser = new TestParser_1.UrlProcessor();
            parser.processUrlsFromFile(fileLocation, ProcessURL);
        }
    }
    else {
        console.log('\nNot a File');
        process.exit(1);
    }
    //close error things etc etc    
});
//# sourceMappingURL=Master.js.map