/*
 * Correctness.ts
 * 
 * Description:
 * This file uses the GitHubAPI to find the maintainers and how quickly they respond to issues.
 * We calculate this by adding up how long some of the issues took to be fixed and storing the total. 
 * Then we divide it by how many issues there were. 
 * 
 * Author: Brayden Devenport
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */


import logger from '../utils/logger.js';
import octokit from '../utils/octokit.js';

// Main function to calculate the "Responsive Maintainer" metric
export async function evaluateResponsiveMaintainers(owner: string, repo: string) {
  try {
    
    const sinceDate = new Date();
    sinceDate.setMonth(sinceDate.getMonth() - 1);

    // Fetch all issues from the repository
    const issuesData = await octokit.issues.listForRepo({
        owner: owner,
        repo: repo,
        since: sinceDate.toISOString(),
        state: 'all',
        per_page: 100,
    });

      
    const issues = issuesData.data;
    
    if (issues.length === 0) {
        return 1;
    }

    let totalResponseTime = 0;
    let responseCount = 0;

    for (const issue of issues) {
        const responseTime = await getFirstResponseTime(owner, repo, issue);
        if (responseTime !== null) {
            totalResponseTime += responseTime;
            responseCount++;
            logger.debug(`Issue #${issue.number} - Response time: ${responseTime} hours`);
        } else {
            logger.debug(`Issue #${issue.number} - No valid maintainer response found`);
        }
    }

    if (responseCount === 0) {
        logger.info('No responses found from maintainers. Setting responsiveMaintainer score to 0.');
        return 0;

    }

    const averageResponseTime = totalResponseTime / responseCount;
    logger.debug(`Average response time: ${averageResponseTime} hours`);

    // Scoring logic based on average response time
    let responseScore = 1;
    if (averageResponseTime <= 24) {  // Less than or equal to 1 day
      responseScore = 1;
      logger.info('Average response time is within 24 hours (1 day). Setting score to 1.');
    } else if (averageResponseTime <= 72) { // Less than or equal to 3 days
        responseScore = 0.8;
        logger.info('Average response time is within 72 hours (3 days). Setting score to 0.8.');
    } else if (averageResponseTime <= 168) { // Less than or equal to 7 days
        responseScore = 0.6;
        logger.info('Average response time is within 168 hours (7 days). Setting score to 0.6.');
    } else if (averageResponseTime <= 336) { // Less than or equal to 14 days
        responseScore = 0.4;
        logger.info('Average response time is within 336 hours (14 days). Setting score to 0.4.');
    } else if (averageResponseTime <= 720) { // Less than or equal to 30 days
        responseScore = 0.2;
        logger.info('Average response time is within 720 hours (30 days). Setting score to 0.2.');
    } else {  // More than 30 days
        responseScore = 0;
        logger.info('Average response time exceeds 720 hours (30 days). Setting score to 0.');
    }


    return responseScore;

  } catch (error) {
    return 0;
    
  }
}

async function getFirstResponseTime(owner: string, repo: string, issue: any): Promise<number | null> {
  try {
      logger.debug(`Fetching comments for issue #${issue.number}`);
      
      const commentsData = await octokit.issues.listComments({
          owner: owner,
          repo: repo,
          issue_number: issue.number,
      });

      const comments = commentsData.data;

      for (const comment of comments) {
          const validAssociations = ['COLLABORATOR', 'MEMBER', 'OWNER', 'CONTRIBUTOR'];
          if (comment.user && validAssociations.includes(comment.author_association)) {
              const issueCreatedAt = new Date(issue.created_at);
              const commentCreatedAt = new Date(comment.created_at);
              const responseTime = (commentCreatedAt.getTime() - issueCreatedAt.getTime()) / (1000 * 60 * 60);
              return responseTime;
          }
      }

      return null;
  } catch (error) {
      logger.info(`Error fetching comments or checking collaborator status for issue #${issue.number}:`, error);
      return null;
  }
}