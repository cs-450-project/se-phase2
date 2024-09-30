/*
 * Master.ts
 * 
 * Description:
 * This file compiles all the necessary files for scoring the URLs
 * 
 * Author: Jacob Esparza
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */

import { UrlProcessor } from "./URLParser";
import { SendToOutput } from "./Output";
import { Calculate } from "./Ranker";
import { Timer } from "./Timer";
import {getBusFactor} from './BusFactor';
import {calculateResponsiveMaintainer} from './ResponsiveMaintainer'
import {evaluateCorrectness} from './CorrectnessMetric'
import {checkLicenseCompatibility} from './LicenseMetric'
import {displayRampupScore} from './RampUpMetric'
import {isPackageOnGitHub} from './VerifyURL'
import {cloneRepository} from './RepoClone'
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
    
    if(isNpmLink(url)){
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
                //Check Rampup
                ranker.SetRampUp = await displayRampupScore(owner, repo);
            }
            else{
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
        }
    }
    else{
        ranker.SetURL = url;
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
        process.exit(1);
    }
    //close error things etc etc    
});
