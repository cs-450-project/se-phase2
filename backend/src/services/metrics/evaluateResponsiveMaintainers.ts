/*
 * Correctness.ts
 * 
 * Description:
 * Evaluates maintainer responsiveness using a configurable sample of recent issues.
 * This approach provides a more accurate picture of current maintenance status
 * while significantly improving performance.
 * 
 * Author: Brayden Devenport
 * Modified: 12-09-2024
 * Version: 1.2
 */

import logger from '../../utils/logger.js';
import octokit from '../../utils/octokit.js';

interface ResponseConfig {
    maxIssues: number;      // Maximum number of recent issues to evaluate
    lookbackDays: number;   // How far back to look for issues
    sampleStrategy: 'sequential' | 'distributed';  // How to select issues within the time period
}

// Default configuration that can be adjusted based on needs
const DEFAULT_CONFIG: ResponseConfig = {
    maxIssues: 50,         // Evaluate only the 50 most recent issues
    lookbackDays: 30,      // Look back 30 days
    sampleStrategy: 'sequential'  // Take the most recent issues
};

// Cache for maintainer status
const maintainerCache = new Map<string, boolean>();

export async function evaluateResponsiveMaintainers(
    owner: string, 
    repo: string, 
    config: Partial<ResponseConfig> = {}
) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    try {
        logger.info(`Starting evaluation of responsive maintainers for ${owner}/${repo}`);
        logger.debug(`Using configuration: ${JSON.stringify(finalConfig)}`);

        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - finalConfig.lookbackDays);

        // Fetch limited set of issues
        const issues = await fetchLimitedIssues(owner, repo, sinceDate, finalConfig);
        
        if (issues.length === 0) {
            logger.info('No issues found in the specified time period.');
            return 1;
        }

        logger.info(`Processing ${issues.length} issues from the last ${finalConfig.lookbackDays} days`);

        // Process selected issues in parallel
        const responsePromises = issues.map(issue => 
            getFirstResponseTime(owner, repo, issue)
        );

        const responseTimes = await Promise.all(responsePromises);
        const validResponseTimes = responseTimes.filter(time => time !== null) as number[];

        if (validResponseTimes.length === 0) {
            logger.info('No valid responses found in sample. Setting score to 0.5.');
            return 0.5;
        }

        // Calculate and log response rate
        const responseRate = validResponseTimes.length / issues.length;
        logger.info(`Response rate: ${(responseRate * 100).toFixed(1)}% (${validResponseTimes.length}/${issues.length} issues)`);

        const averageResponseTime = validResponseTimes.reduce((a, b) => a + b, 0) / validResponseTimes.length;
        const score = calculateResponseScore(averageResponseTime, responseRate);
        
        logger.info(`Final responsive maintainer score for ${owner}/${repo}: ${score}`);
        return score;

    } catch (error) {
        logger.error(`Error evaluating responsive maintainers for ${owner}/${repo}:`, error);
        return 0.5;
    }
}

async function fetchLimitedIssues(
    owner: string, 
    repo: string, 
    sinceDate: Date, 
    config: ResponseConfig
) {
    const issues = [];
    let page = 1;
    const per_page = Math.min(100, config.maxIssues); // Optimize API calls

    while (issues.length < config.maxIssues) {
        const response = await octokit.issues.listForRepo({
            owner,
            repo,
            since: sinceDate.toISOString(),
            state: 'all',
            per_page,
            page,
            sort: 'created',
            direction: 'desc'
        });

        if (response.data.length === 0) break;
        
        issues.push(...response.data);
        
        if (response.data.length < per_page || issues.length >= config.maxIssues) {
            break;
        }
        
        page++;
    }

    // If using distributed sampling, select evenly distributed issues
    if (config.sampleStrategy === 'distributed' && issues.length > config.maxIssues) {
        const stride = Math.floor(issues.length / config.maxIssues);
        return issues.filter((_, index) => index % stride === 0).slice(0, config.maxIssues);
    }

    // Otherwise return the most recent issues up to maxIssues
    return issues.slice(0, config.maxIssues);
}

function calculateResponseScore(averageResponseTime: number, responseRate: number): number {
    // Base score from response time
    let timeScore = 1.0;
    if (averageResponseTime <= 48) {
        timeScore = 1.0;
    } else if (averageResponseTime <= 96) {
        timeScore = 0.9;
    } else if (averageResponseTime <= 168) {
        timeScore = 0.8;
    } else if (averageResponseTime <= 336) {
        timeScore = 0.6;
    } else if (averageResponseTime <= 720) {
        timeScore = 0.4;
    } else {
        timeScore = 0.2;
    }

    // Weight the final score by response rate
    const weightedScore = (timeScore * 0.7) + (responseRate * 0.3);
    return Math.round(weightedScore * 100) / 100;
}

async function getFirstResponseTime(owner: string, repo: string, issue: any): Promise<number | null> {
    try {
        // Skip processing if the issue is too recent
        const issueAge = (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60);
        if (issueAge < 24) {
            return null;
        }

        const commentsData = await octokit.issues.listComments({
            owner,
            repo,
            issue_number: issue.number,
            per_page: 30,
        });

        const comments = commentsData.data;
        const issueCreatedAt = new Date(issue.created_at).getTime();

        for (const comment of comments) {
            if (!comment.user) continue;

            const cacheKey = `${owner}/${repo}/${comment.user.login}`;
            let isMaintainer = maintainerCache.get(cacheKey);

            if (isMaintainer === undefined) {
                const validAssociations = ['COLLABORATOR', 'MEMBER', 'OWNER', 'CONTRIBUTOR'];
                isMaintainer = validAssociations.includes(comment.author_association);
                maintainerCache.set(cacheKey, isMaintainer);
            }

            if (isMaintainer) {
                return (new Date(comment.created_at).getTime() - issueCreatedAt) / (1000 * 60 * 60);
            }
        }

        return null;
    } catch (error) {
        logger.error(`Error processing issue #${issue.number}:`, error);
        return null;
    }
}