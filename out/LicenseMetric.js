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
// Function to fetch repository license information
function getRepoLicense(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/license`, {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // GitHub API token from .env file
                },
            });
            return response.data.license;
        }
        catch (error) {
            console.error(`Error fetching license: ${error}`);
            return null;
        }
    });
}
// Function to check if the repository license is compatible with LGPL-2.1
function checkLicenseCompatibility(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const license = yield getRepoLicense(owner, repo);
        if (!license) {
            console.log('License information could not be retrieved.');
            return;
        }
        const licenseKey = license.spdx_id.toLowerCase(); // Get the SPDX ID of the license
        if (compatibleLicenses.includes(licenseKey)) {
            //Output a 1 if the repo license is compatible with LGPL-2.1
            //console.log(`The repository uses ${license.name}, which is compatible with LGPL-2.1.`);
            return 1;
        }
        else {
            //Output a 0 if the repo license is not compatible with LGPL-2.1
            //console.log(`The repository uses ${license.name}, which is NOT compatible with LGPL-2.1.`);
            return 0;
        }
    });
}
// Example usage: Check the license compatibility for a repository
//checkLicenseCompatibility('facebook', 'react'); 
//# sourceMappingURL=LicenseMetric.js.map