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
//Tester file
// Import the getBusFactor function from BusFactor.ts
const BusFactor_1 = require("./BusFactor");
// Import the function from ResponsiveMaintainer.ts
const ResponsiveMaintainer_1 = require("./ResponsiveMaintainer");
// Import the function from ResponsiveMaintainer.ts
const CorrectnessMetric_1 = require("./CorrectnessMetric");
// Import the function from LicenseMetric.ts
const LicenseMetric_1 = require("./LicenseMetric");
// Example usage of getBusFactor in RetrieveMetrics.ts
function retrieveMetrics() {
    return __awaiter(this, void 0, void 0, function* () {
        //Example repo
        const owner = 'facebook';
        const repo = 'react';
        console.log(`Calculating bus factor for ${owner}/${repo}...`);
        // Call getBusFactor to calculate and log the bus factor
        yield (0, BusFactor_1.getBusFactor)(owner, repo);
        yield (0, ResponsiveMaintainer_1.calculateResponsiveMaintainer)(owner, repo);
        console.log(`Calculating Correctness for ${owner}/${repo}...`);
        yield (0, CorrectnessMetric_1.evaluateCorrectness)(owner, repo);
        console.log(`Figuring out License compatibility for ${owner}/${repo}... `);
        yield (0, LicenseMetric_1.checkLicenseCompatibility)(owner, repo);
    });
}
retrieveMetrics();
//# sourceMappingURL=RetrieveMetrics.js.map