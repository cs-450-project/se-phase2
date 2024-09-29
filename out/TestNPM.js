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
const verifyURL_1 = require("./verifyURL");
function GetRepoInfo(url) {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);
    if (match) {
        const owner = match[1];
        const repo = match[2];
        return { owner, repo };
    }
    return null; // Return null if the URL doesn't match
}
function isNpmLink(url) {
    const npmRegex = /^(https?:\/\/(www\.)?npmjs\.com\/|npm:\/\/)/;
    return npmRegex.test(url);
}
function Test() {
    return __awaiter(this, void 0, void 0, function* () {
        let url = "https://www.npmjs.com/package/browserify";
        console.log(isNpmLink(url));
        let repoInfo;
        if (isNpmLink(url)) {
            console.log("Checking for NPM link");
            let newURL = yield (0, verifyURL_1.isPackageOnGitHub)(url);
            if (newURL) {
                url = newURL;
                console.log("Attempting to get GitHub Link");
                repoInfo = GetRepoInfo(url);
            }
            else {
                repoInfo = null;
            }
        }
        else {
            repoInfo = GetRepoInfo(url);
        }
        console.log(repoInfo);
    });
}
Test();
//# sourceMappingURL=TestNPM.js.map