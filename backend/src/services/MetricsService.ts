/** 
 * @file MetricsService.ts
 * Service contains the business logic for handling metrics data & calculation.
 * 
 */

import { ApiError } from "../utils/errors/ApiError.js";
import { evaluateMetrics } from "./evaluators/evaluateMetrics.js";
import { Ranker } from "./scores/Ranker.js";

export class MetricsService {

    // Evaluate metrics, create PackageRating, and return net score
    static async getNetScoreAndCreatePackageRating (owner: string, repo: string): Promise<number> {
        return 0;
    }

}
