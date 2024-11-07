/*
 * Master.ts
 * 
 * Description:
 * This file compiles all the necessary files for scoring the URLs.
 * It times each metric collected and gathers metric information,
 * then outputs the metrics as JSON.
 * It also retrieves repo/owner names or tests if a link is from npmjs.
 * 
 * Author: Jacob Esparza
 * Date: 10-31-2024
 * Version: 1.1
 * 
 */

import logger from '../logger.js';
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
import { evaluateDependencyPinning } from "../metrics/evaluateDependencyPinning.js";
import { evaluateCodeReview } from "../metrics/evaluateCodeReview.js";

export async function evaluateMetrics(url: string, urlNum: number){
    const ranker = new Ranker();
    const totalTime = new Timer();
    const factorTime = new Timer();
    let repoInfo;
    
    logger.debug(`Evaluating metrics for URL: ${url}`);

    if(isNPMLink(url)){
        logger.debug(`URL is an NPM link: ${url}`);
        let newURL = await findGitHubRepoForNPMLink(url);
        if(newURL){
            url = newURL;
            repoInfo = getRepoInfo(url);
            logger.debug(`Converted NPM link to GitHub URL: ${url}`);
        }
        else{
            logger.info('No GitHub repo for URL ' + url);
            repoInfo = null;
        }
    }
    else{
        repoInfo = getRepoInfo(url);
    }

    if(repoInfo){
        const { owner, repo } = repoInfo;
        logger.debug(`Extracted owner: ${owner}, repo: ${repo} from URL: ${url}`);

        if(owner && repo){
            totalTime.start();
            ranker.URL = url;

            factorTime.start();
            // Check Bus Factor
            ranker.busFactor = Number(await evaluateBusFactor(owner, repo));
            ranker.busFactorLatency = factorTime.stop();
            logger.debug(`Bus Factor: ${ranker.busFactor}, Latency: ${ranker.busFactorLatency}`);

            factorTime.start();
            // Check Correctness
            ranker.correctness = Number(await evaluateCorrectness(owner, repo));
            ranker.correctnessLatency = factorTime.stop();
            logger.debug(`Correctness: ${ranker.correctness}, Latency: ${ranker.correctnessLatency}`);
            
            factorTime.start();
            // Check License
            ranker.license = Number(await evaluateLicense(owner, repo));
            ranker.licenseLatency = factorTime.stop();
            logger.debug(`License: ${ranker.license}, Latency: ${ranker.licenseLatency}`);
            
            factorTime.start();
            // Check RampUp
            ranker.rampUp = await evaluateRampUp(owner, repo);
            ranker.rampUpLatency = factorTime.stop();
            logger.debug(`RampUp: ${ranker.rampUp}, Latency: ${ranker.rampUpLatency}`);

            factorTime.start();
            // Check Responsive Maintainers
            ranker.responsiveMaintainers = Number(await evaluateResponsiveMaintainers(owner, repo));
            ranker.responsiveMaintainersLatency = factorTime.stop();
            logger.debug(`Responsive Maintainers: ${ranker.responsiveMaintainers}, Latency: ${ranker.responsiveMaintainersLatency}`);
           
            factorTime.start();
            // Check Dependency Pinning Fraction
            ranker.dependencyPinning = await evaluateDependencyPinning(owner, repo);
            ranker.dependencyPinningLatency = factorTime.stop();
            logger.debug(`Dependency Pinning Fraction: ${ranker.dependencyPinning}, Latency: ${ranker.dependencyPinningLatency}`);
            
            factorTime.start();
            // Check Code Review Fraction
            ranker.codeReview = await evaluateCodeReview(owner, repo);
            ranker.codeReviewLatency = factorTime.stop();
            logger.debug(`Code Review Fraction: ${ranker.codeReview}, Latency: ${ranker.codeReviewLatency}`);

            // Ends the NetScore timer and sends the time to the ranker
            ranker.netScoreLatency = totalTime.stop();
            logger.debug(`NetScore Latency: ${ranker.netScoreLatency}`);
        }
        else{
            logger.info("Could not get repo owner or name from URL " + url);
            ranker.URL = url;
        }
    }
    else{
        logger.info("Could not get repo owner or name from URL " + url);
        ranker.URL = url;
    }

    sendToOutput.writeToStdout({ 
        URL: ranker.URL, 
        NetScore: ranker.netScore, 
        NetScore_Latency: ranker.netScoreLatency, 
        RampUp: ranker.rampUp, 
        RampUp_Latency: ranker.rampUpLatency, 
        Correctness: ranker.correctness, 
        Correctness_Latency: ranker.correctnessLatency, 
        BusFactor: ranker.busFactor, 
        BusFactor_Latency: ranker.busFactorLatency, 
        ResponsiveMaintainers: ranker.responsiveMaintainers, 
        ResponsiveMaintainers_Latency: ranker.responsiveMaintainersLatency, 
        License: ranker.license, 
        License_Latency: ranker.licenseLatency, 
        DependencyPinning: ranker.dependencyPinning,
        DependencyPinning_Latency: ranker.dependencyPinningLatency,
        CodeReview: ranker.codeReview,
        CodeReviewFraction_Latency: ranker.codeReviewLatency
    });

    logger.debug(`Metrics evaluation completed for URL: ${url}`);
    ranker.clear();
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
