/*
 * Master.ts
 * 
 * Description:
 * This file compiles all the necessary files for scoring the URLs
 * It will time each metric collected and collect the metric information.
 * It will then send it to the output method using JSON
 * It also does extra things to accomplish this, such as getting repo/owner names or testing if a link is from npmjs
 * 
 * Author: Jacob Esparza
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */

import logger from '../utils/logger.js';

import { sendToOutput } from "../utils/sendToOutput.js";
import { Ranker } from "../scores/Ranker.js";
import { Timer } from "../utils/Timer.js";
import { findGitHubRepoForNPMLink } from './findGitHubRepoForNPMLink.js';

// Importing the functions to calculate the metrics
import { evaluateBusFactor } from "../metrics/evaluateBusFactor.js";
import { evaluateCorrectness } from "../metrics/evaluateCorrectness.js";
import { evaluateLicense } from "../metrics/evaluateLicense.js";
import { evaluateRampUp } from "../metrics/evaluateRampUp.js";
import { evaluateResponsiveMaintainers } from "../metrics/evaluateResponsiveMaintainers.js";

export async function evaluateMetrics(url: string, urlNum: number){
    const ranker = new Ranker();
    const totalTime = new Timer();
    const factorTime = new Timer();
    let repoInfo;
    
    if(isNPMLink(url)){
        let newURL = await findGitHubRepoForNPMLink(url);
        if(newURL){
            url = newURL;
            repoInfo = getRepoInfo(url);
            
        }
        else{
            logger.info('No github repo for URL ' + url);
            repoInfo = null;
        }
    }
    else{
        repoInfo = getRepoInfo(url);
        
    }

    if(repoInfo){

        const { owner, repo } = repoInfo;

        if(owner && repo){
            totalTime.start();
            ranker.SetURL = url;

            factorTime.start();
            //Check Bus Factor
            ranker.SetBusFactor = Number(await evaluateBusFactor(owner, repo));
            ranker.SetBusFactorLatency = factorTime.stop();
        
            factorTime.start();
            //Check Correctness
            ranker.SetCorrectness = Number(await evaluateCorrectness(owner, repo));
            ranker.SetCorrectnessLatency = factorTime.stop();
            
            factorTime.start();
            //Check License
            ranker.SetLicense = Number(await evaluateLicense(owner, repo));
            ranker.SetLicenseLatency = factorTime.stop();
            
            factorTime.start();
            //Check RampUp
            ranker.SetRampUp = await evaluateRampUp(owner, repo);
            ranker.SetRampUpLatency = factorTime.stop();

            factorTime.start();
            //Check ResponsiveMaintainer
            ranker.SetResponsiveMaintainers = Number(await evaluateResponsiveMaintainers(owner, repo));
            ranker.SetResponsiveMaintainersLatency = factorTime.stop();
           
            //Ends the NetScore timer and sends the time to the ranker
            ranker.SetNetScoreLatency = totalTime.stop();

        }
        else{
            logger.info("Could not get repo owner or name from URL" + url);
            ranker.SetURL = url;
        }
    }
    else{
        logger.info("Could not get repo owner or name from URL" + url);
        ranker.SetURL = url;
    }

    sendToOutput.writeToStdout({ URL: ranker.GetURL, NetScore: ranker.GetNetScore, NetScore_Latency: ranker.GetNetScoreLatency, 
        RampUp: ranker.GetRampUp, RampUp_Latency: ranker.GetRampUpLatency, Correctness: ranker.GetCorrectness, Correctness_Latency: ranker.GetCorrectnessLatency, 
        BusFactor: ranker.GetBusFactor, BusFactor_Latency: ranker.GetBusFactorLatency, ResponsiveMaintainer: ranker.GetResponsiveMaintainers, ResponsiveMaintainer_Latency: ranker.GetResponsiveMaintainersLatency, 
        License: ranker.GetLicense, License_Latency: ranker.GetLicenseLatency});


    ranker.Clear();
    
}

function getRepoInfo(url: string): {owner: string; repo: string} | null{
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);

    if (match) {
        const owner = match[1];
        const repo = match[2];
        return { owner, repo };
    }
    return null; // Return null if the URL doesn't match
}

function isNPMLink(url: string): boolean {
    const npmRegex = /^(https?:\/\/(www\.)?npmjs\.com\/|npm:\/\/)/;
    return npmRegex.test(url);
}



