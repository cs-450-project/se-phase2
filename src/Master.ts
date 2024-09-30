import { UrlProcessor } from "./TestParser";
import { SendToOutput } from "./TestOutput";
import { Calculate } from "./TestRanker";
import { Timer } from "./timer";
import {getBusFactor} from './BusFactor';
import {calculateResponsiveMaintainer} from './ResponsiveMaintainer'
import {evaluateCorrectness} from './CorrectnessMetric'
import {checkLicenseCompatibility} from './LicenseMetric'
import {displayRampupScore} from './RampUpMetric'
import {isPackageOnGitHub} from './verifyURL'
import {cloneRepository} from './repoClone'
import * as path from 'path';
import * as fs from 'fs';

function GetRepoInfo(url: string): {owner: string; repo: string} | null{
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);

    if (match) {
        const owner = match[1];
        const repo = match[2];
        return { owner, repo };
    }
    return null; // Return null if the URL doesn't match
}

function isNpmLink(url: string): boolean {
    const npmRegex = /^(https?:\/\/(www\.)?npmjs\.com\/|npm:\/\/)/;
    return npmRegex.test(url);
}


async function ProcessURL(url: string, urlNum: number){
    const ranker = new Calculate();
    const totalTime = new Timer();
    const factorTime = new Timer();
    let repoInfo;
    console.log(urlNum);
    
    if(isNpmLink(url)){
        console.log("Checking for NPM link");
        let newURL = await isPackageOnGitHub(url);
        if(newURL){
            url = newURL;
            repoInfo = GetRepoInfo(url);
            
        }
        else{
            repoInfo = null;
        }
    }
    else{
        repoInfo = GetRepoInfo(url);
        
    }

    if(repoInfo){

        const { owner, repo } = repoInfo;
        console.log("Git Repo Grabbed : " + owner + " " + repo + " " + urlNum);

        if(owner && repo){
            totalTime.StartTime();
            ranker.SetURL = url;

            factorTime.StartTime();
            //Check Bus Factor
            ranker.SetBusFactor = Number(await getBusFactor(owner, repo));
            ranker.SetBusFactorLatency = factorTime.GetTime();
            factorTime.Reset();

            factorTime.StartTime();
            //Check Correctness
            ranker.SetCorrectness = Number(await evaluateCorrectness(owner, repo));
            ranker.SetCorrectnessLatency = factorTime.GetTime();
            factorTime.Reset();
            
            factorTime.StartTime();
            //Check License
            ranker.SetLicense = Number(await checkLicenseCompatibility(owner, repo));
            ranker.SetLicenseLatency = factorTime.GetTime();
            factorTime.Reset();

            factorTime.StartTime();
            if(urlNum > 0){
                console.log("Checking RampUp for URL: " + url);
                //Check Rampup
                ranker.SetRampUp = await displayRampupScore(owner, repo);
            }
            else{
                console.log("Cloning Repo from Master");
                ranker.SetRampUp = await cloneRepository(url);
            }
            ranker.SetRampUpLatency = factorTime.GetTime();
            factorTime.Reset();

            factorTime.StartTime();
            //Check ResponsiveMaintainer
            ranker.SetResponsiveMaintainer = Number(await calculateResponsiveMaintainer(owner, repo));
            ranker.SetResponsiveMaintainerLatency = factorTime.GetTime();
            factorTime.Reset();

            //Ends the NetScore timer and sends the time to the ranker
            ranker.SetNetScoreLatency = totalTime.GetTime();
            totalTime.Reset();
        }
        else{
            ranker.SetURL = url;
            console.log("Unable to connecto to repo, could not find the owner name and the repo name");
        }
    }
    else{
        ranker.SetURL = url;
        console.log("Unable to connecto to repo");
    }

    SendToOutput.writeToStdout({ URL: ranker.GetURL, NetScore: ranker.GetNetScore, NetScore_Latency: ranker.GetNetScoreLatency, 
        RampUp: ranker.GetRampUp, RampUp_Latency: ranker.GetRampUpLatency, Correctness: ranker.GetCorrectness, Correctness_Latency: ranker.GetCorrectnessLatency, 
        BusFactor: ranker.GetBusFactor, BusFactor_Latency: ranker.GetBusFactorLatency, ResponsiveMaintainer: ranker.GetResponsiveMaintainer, ResponsiveMaintainer_Latency: ranker.GetResponsiveMaintainerLatency, 
        License: ranker.GetLicense, License_Latency: ranker.GetLicenseLatency});


    ranker.Clear();
    
}


//Read Input
const fileLocation : string = process.argv[2];     //Gives argument three, which *should* be the file location
//Outputs file
fs.stat(fileLocation, (err, stats) => {
    if (err==null){
        if(stats.isFile()){
        const parser = new UrlProcessor();
        parser.processUrlsFromFile(fileLocation, ProcessURL);
        }
    }
    else{
        console.log('\nNot a File');
        process.exit(1);
    }
    //close error things etc etc    
});
