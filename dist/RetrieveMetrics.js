"use strict";
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
// Import the function from ResponsiveMaintainer.ts
const CorrectnessMetric_1 = require("./CorrectnessMetric");
// Example usage of getBusFactor in RetrieveMetrics.ts
function retrieveMetrics() {
    return __awaiter(this, void 0, void 0, function* () {
        //Example repo
        const owner = 'IAmDarkMeadow';
        const repo = 'CS45000-ECE46100';
        //console.log(`Calculating bus factor for ${owner}/${repo}...`);
        //Call getBusFactor to calculate and log the bus factor
        // await getBusFactor(owner, repo);
        // await calculateResponsiveMaintainer(owner, repo);
        console.log(`Calculating Correctness for ${owner}/${repo}...`);
        yield (0, CorrectnessMetric_1.calculateCorrectnessScore)(owner, repo);
        //console.log(`Figuring out License compatibility for ${owner}/${repo}... `);
        //await checkLicenseCompatibility(owner, repo);
    });
}
retrieveMetrics();
//# sourceMappingURL=RetrieveMetrics.js.map