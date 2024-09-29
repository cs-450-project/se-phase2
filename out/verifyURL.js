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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
function isPackageOnGitHub(packageName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch package data from npm registry
            const response = yield axios_1.default.get(`https://registry.npmjs.org/${packageName}`);
            // Get the repository field
            const repository = response.data.repository;
            // Check if the repository field exists and points to GitHub
            if (repository && typeof repository === 'object' && repository.url) {
                const repoUrl = repository.url;
                if (repoUrl.includes('github.com')) {
                    return repoUrl;
                } //end if statement
            }
            else {
                console.log(`No repository information found for package: ${packageName}`);
                return null;
            }
        }
        catch (error) {
            console.error(`Failed to fetch package information for ${packageName}:`, error);
            return null;
        }
    });
}
//# sourceMappingURL=verifyURL.js.map