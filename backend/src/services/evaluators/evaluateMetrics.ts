/**
 * @file evaluateMetrics.ts
 * Evaluates multiple metrics for a GitHub repository and compiles them into a final score.
 * Metrics include: Bus Factor, Correctness, License, Ramp Up Time, 
 * Responsive Maintainers, Dependency Pinning, and Code Review.
 */

import logger from '../../utils/logger.js';
import { Ranker } from "../scores/Ranker.js";
import { Timer } from "../../utils/Timer.js";
import octokit from '../../utils/octokit.js';
import { ApiError } from "../../utils/errors/ApiError.js";

// Import metric evaluation functions
import { evaluateBusFactor } from "../metrics/evaluateBusFactor.js";
import { evaluateCorrectness } from "../metrics/evaluateCorrectness.js";
import { evaluateLicense } from "../metrics/evaluateLicense.js";
import { evaluateRampUp } from "../metrics/evaluateRampUp.js";
import { evaluateResponsiveMaintainers } from "../metrics/evaluateResponsiveMaintainers.js";
import { evaluateDependencyPinning } from "../metrics/evaluateDependencyPinning.js";
import { evaluateCodeReview } from "../metrics/evaluateCodeReview.js";

/**
 * Evaluates all metrics for a given GitHub repository
 * @param owner - GitHub repository owner
 * @param repo - GitHub repository name
 * @returns Ranker instance containing all metric scores and latencies
 * @throws ApiError if repository is invalid or metrics cannot be evaluated
 */
export async function evaluateMetrics(owner: string, repo: string): Promise<{ ranker: Ranker, readmeContent: string}> {
    try {
        // Input validation
        if (!owner || !repo) {
            throw new ApiError('Repository owner and name are required', 400);
        }

        logger.debug(`Starting metrics evaluation for ${owner}/${repo}`);
        
        const ranker = new Ranker();
        const totalTime = new Timer();
        const factorTime = new Timer();
        
        var readmeContent: string = '';

        totalTime.start();

        // Evaluate each metric in sequence with error handling
        try {
            factorTime.start();
            ranker.busFactor = Number(await evaluateBusFactor(owner, repo));
            ranker.busFactorLatency = factorTime.stop();
            logger.debug(`Bus Factor: ${ranker.busFactor}, Latency: ${ranker.busFactorLatency}ms`);
        } catch (error) {
            logger.error(`Bus Factor evaluation failed: ${error}`);
            ranker.busFactor = 0;
        }

        

        

        try {
            factorTime.start();

            logger.debug(`Fetching README for ${owner}/${repo}`);
            const readmeData = await octokit.repos.getReadme({
                owner: owner,
                repo: repo,
            });
            readmeContent = Buffer.from(readmeData.data.content, 'base64').toString('utf-8');

            ranker.rampUp = await evaluateRampUp(readmeContent);
            ranker.rampUpLatency = factorTime.stop();
            logger.debug(`RampUp: ${ranker.rampUp}, Latency: ${ranker.rampUpLatency}ms`);
        } catch (error) {
            logger.error(`RampUp evaluation failed: ${error}`);
            ranker.rampUp = 0;
        }

        try {
            factorTime.start();
            // Check if a README exists (as found before)
            const readme = !(readmeContent === '');
            ranker.correctness = Number(await evaluateCorrectness(owner, repo, readme));
            ranker.correctnessLatency = factorTime.stop();
            logger.debug(`Correctness: ${ranker.correctness}, Latency: ${ranker.correctnessLatency}ms`);
        } catch (error) {
            logger.error(`Correctness evaluation failed: ${error}`);
            ranker.correctness = 0;
        }

        try {
            factorTime.start();
            ranker.license = Number(await evaluateLicense(owner, repo, readmeContent));
            ranker.licenseLatency = factorTime.stop();
            logger.debug(`License: ${ranker.license}, Latency: ${ranker.licenseLatency}ms`);
        } catch (error) {
            logger.error(`License evaluation failed: ${error}`);
            ranker.license = 0;
        }

        try {
            factorTime.start();
            ranker.responsiveMaintainers = Number(await evaluateResponsiveMaintainers(owner, repo));
            ranker.responsiveMaintainersLatency = factorTime.stop();
            logger.debug(`Responsive Maintainers: ${ranker.responsiveMaintainers}, Latency: ${ranker.responsiveMaintainersLatency}ms`);
        } catch (error) {
            logger.error(`Responsive Maintainers evaluation failed: ${error}`);
            ranker.responsiveMaintainers = 0;
        }

        try {
            factorTime.start();
            ranker.dependencyPinning = await evaluateDependencyPinning(owner, repo);
            ranker.dependencyPinningLatency = factorTime.stop();
            logger.debug(`Dependency Pinning: ${ranker.dependencyPinning}, Latency: ${ranker.dependencyPinningLatency}ms`);
        } catch (error) {
            logger.error(`Dependency Pinning evaluation failed: ${error}`);
            ranker.dependencyPinning = 0;
        }

        try {
            factorTime.start();
            ranker.codeReview = await evaluateCodeReview(owner, repo);
            ranker.codeReviewLatency = factorTime.stop();
            logger.debug(`Code Review: ${ranker.codeReview}, Latency: ${ranker.codeReviewLatency}ms`);
        } catch (error) {
            logger.error(`Code Review evaluation failed: ${error}`);
            ranker.codeReview = 0;
        }

        try {
            const weights = {
                busFactor: 0.2,
                correctness: 0.2,
                rampUp: 0.2,
                responsiveMaintainers: 0.2,
                license: 0.1,
                dependencyPinning: 0.05,
                codeReview: 0.05
            };
            const score = (
                ranker.busFactor * weights.busFactor +
                ranker.correctness * weights.correctness +
                ranker.rampUp * weights.rampUp +
                ranker.responsiveMaintainers * weights.responsiveMaintainers +
                ranker.license * weights.license +
                ranker.dependencyPinning * weights.dependencyPinning +
                ranker.codeReview * weights.codeReview
            ).toFixed(3);

            ranker.netScore = Number(score);
        } catch (error) {
            logger.error(`Failed to calculate net score: ${error}`);
            ranker.netScore = -1;    
        }

        ranker.netScoreLatency = totalTime.stop();
        
        logger.debug(`Completed metrics evaluation for ${owner}/${repo}`);
        logger.debug(`Net Score: ${ranker.netScore}, Total Latency: ${ranker.netScoreLatency}ms`);

        return { ranker, readmeContent };

    } catch (error) {
        logger.error(`Metrics evaluation failed for ${owner}/${repo}: ${error}`);
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to evaluate repository metrics', 500);
    }
}