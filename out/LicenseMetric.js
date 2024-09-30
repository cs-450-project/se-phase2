"use strict";
/*
 * Correctness.ts
 *
 * Description:
 * This file uses the GitHubAPI to find the license compatability based on the requirements document
 *
 * Author: Brayden Devenport
 * Date: 9-29-2024
 * Version: 1.0
 *
 */
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
const Logger_1 = __importDefault(require("./Logger"));
// Load environment variables from .env
dotenv.config();
// Base URL for GitHub API
const GITHUB_API_BASE_URL = 'https://api.github.com';
// Compatible licenses with LGPL-2.1
const compatibleLicenses = ['lgpl-2.1', 'gpl-2.0', 'gpl-3.0', 'lgpl-3.0'];
// Function to fetch repository license information
function getRepoLicense(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/license`, {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // GitHub API token from .env file
                },
            });
            if (response.data.license.spdx_id === 'NOASSERTION') {
                // Try to fetch the LICENSE file manually
                const licenseFileResponse = yield axios_1.default.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents/COPYING`, // Adjust the path based on where the license is located
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    },
                });
                const licenseContent = Buffer.from(licenseFileResponse.data.content, 'base64').toString('utf-8');
                // Check if the license file contains 'GPL-2.0' or other relevant license information
                if (licenseContent.includes('GNU GENERAL PUBLIC LICENSE') && licenseContent.includes('Version 2')) {
                    return 'gpl-2.0'; // Return the GPL-2.0 identifier manually
                }
            }
            return response.data.license.spdx_id;
        }
        catch (error) {
            Logger_1.default.info('Failed to access GitHub API');
            Logger_1.default.info(error);
            return 0;
        }
    });
}
// Function to check if the repository license is compatible with LGPL-2.1
function checkLicenseCompatibility(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const licenseKey = yield getRepoLicense(owner, repo);
        if (!licenseKey) {
            return 0;
        }
        if (compatibleLicenses.includes(licenseKey.toLowerCase())) {
            return 1; // Output 1 for compatible license
        }
        else {
            return 0; // Output 0 for non-compatible license
        }
    });
}
// Example usage: Check the license compatibility for a repository
//checkLicenseCompatibility('nodists', 'nodist');
//# sourceMappingURL=LicenseMetric.js.map