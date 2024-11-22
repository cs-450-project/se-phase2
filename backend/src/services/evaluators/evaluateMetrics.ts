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

import logger from '../../utils/logger.js';
import { Ranker } from "../scores/Ranker.js";
import { Timer } from "../../utils/Timer.js";

// Importing the functions to calculate the metrics
import { evaluateBusFactor } from "../metrics/evaluateBusFactor.js";
import { evaluateCorrectness } from "../metrics/evaluateCorrectness.js";
import { evaluateLicense } from "../metrics/evaluateLicense.js";
import { evaluateRampUp } from "../metrics/evaluateRampUp.js";
import { evaluateResponsiveMaintainers } from "../metrics/evaluateResponsiveMaintainers.js";
import { evaluateDependencyPinning } from "../metrics/evaluateDependencyPinning.js";
import { evaluateCodeReview } from "../metrics/evaluateCodeReview.js";

export async function evaluateMetrics(owner: string, repo: string): Promise<Ranker>{
    const ranker = new Ranker();
    const totalTime = new Timer();
    const factorTime = new Timer();
    
    logger.debug(`Evaluating metrics for owner: ${owner}, repo: ${repo}`);

    if(owner && repo){
        
        totalTime.start();

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

        ranker.netScore = ranker.netScore;

        // Ends the NetScore timer and sends the time to the ranker
        ranker.netScoreLatency = totalTime.stop();
        logger.debug(`NetScore Latency: ${ranker.netScoreLatency}`);
    }

    

    return ranker;

}
