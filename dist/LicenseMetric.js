"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLicenseCompatibility = checkLicenseCompatibility;
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables from .env
dotenv.config();
// Base URL for GitHub API
const GITHUB_API_BASE_URL = 'https://api.github.com';
// Compatible licenses with LGPL-2.1
const compatibleLicenses = ['lgpl-2.1', 'gpl-2.0', 'gpl-3.0', 'lgpl-3.0'];
// Function to fetch the LICENSE file or README file from the repository
function getRepoLicense(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 1. Check for LICENSE file in the root directory
            const licenseFileUrl = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents/LICENSE`;
            const response = yield axios_1.default.get(licenseFileUrl, {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // GitHub API token from .env file
                },
            });
            // Decode the LICENSE file content
            const licenseContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
            // Check if the license contains relevant GPL versions
            if (licenseContent.includes('GNU GENERAL PUBLIC LICENSE')) {
                if (licenseContent.includes('Version 2')) {
                    console.log('Detected GPL-2.0');
                    return 'gpl-2.0';
                }
                else if (licenseContent.includes('Version 3')) {
                    console.log('Detected GPL-3.0');
                    return 'gpl-3.0';
                }
            }
            if (licenseContent.includes('GNU LESSER GENERAL PUBLIC LICENSE')) {
                if (licenseContent.includes('Version 2.1')) {
                    console.log('Detected LGPL-2.0');
                    return 'lgpl-2.1';
                }
                else if (licenseContent.includes('Version 3')) {
                    console.log('Detected LGPL-3.0');
                    return 'lgpl-3.0';
                }
            }
            // If the content does not match any relevant GPL version, continue to README check
            return null;
        }
        catch (error) {
            //console.log('LICENSE file not found or could not be processed, checking README for license section...');
            return yield getLicenseFromReadme(owner, repo);
        }
    });
}
// Function to fetch license section from README file
function getLicenseFromReadme(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const readmeUrl = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents/README.md`;
            const response = yield axios_1.default.get(readmeUrl, {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                },
            });
            // Decode README content
            const readmeContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
            // Extract license section from README (simple regex to look for "License" heading)
            const licenseSection = readmeContent.match(/##?\s*License[\s\S]*?\n(.*)/i);
            if (licenseSection && licenseSection[1]) {
                return licenseSection[1].trim();
            }
            else {
                console.log('No license section found in README.');
                return;
            }
        }
        catch (error) {
            console.error(`Error fetching README file: ${error}`);
            return;
        }
    });
}
// Function to check if the repository license is compatible with LGPL-2.1
function checkLicenseCompatibility(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const licenseContent = yield getRepoLicense(owner, repo);
        if (!licenseContent) {
            console.log('License information could not be retrieved.');
            return 0;
        }
        // Check if the license content contains any compatible license keywords
        const isCompatible = compatibleLicenses.some(license => licenseContent.toLowerCase().includes(license));
        if (isCompatible) {
            console.log(`The license is compatible with LGPL-2.1.`);
            return 1;
        }
        else {
            console.log(`The license is NOT compatible with LGPL-2.1.`);
            return 0;
        }
    });
}
//# sourceMappingURL=LicenseMetric.js.map