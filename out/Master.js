"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestParser_1 = require("./TestParser");
const TestOutput_1 = require("./TestOutput");
const TestRanker_1 = require("./TestRanker");
const Timer_1 = require("./Timer");
const fs = require("fs");
function ProcessURL(url) {
    const ranker = new TestRanker_1.Calculate();
    const totalTime = new Timer_1.Timer();
    const factorTime = new Timer_1.Timer();
    totalTime.StartTime();
    ranker.SetURL = url;
    factorTime.StartTime();
    //Check BusFactor
    ranker.SetBusFactor = Math.random() * (30 - 1) + 1;
    ranker.SetBusFactorLatency = factorTime.GetTime();
    factorTime.Reset();
    factorTime.StartTime();
    //Check Correctness
    ranker.SetCorrectness = Math.random() * (30 - 1) + 1;
    ranker.SetCorrectnessLatency = factorTime.GetTime();
    factorTime.Reset();
    factorTime.StartTime();
    //Check License
    ranker.SetLicense = Math.random() < 0.5 ? 0 : 1;
    ranker.SetLicenseLatency = factorTime.GetTime();
    factorTime.Reset();
    //PUT IF STATEMENT HERE FOR REPO CLONE
    factorTime.StartTime();
    //Check Rampup
    ranker.SetRampUp = Math.random() * (30 - 1) + 1;
    ranker.SetRampUpLatency = factorTime.GetTime();
    factorTime.Reset();
    factorTime.StartTime();
    //Check ResponsiveMaintainer
    ranker.SetResponsiveMaintainer = Math.random() * (30 - 1) + 1;
    ranker.SetResponsiveMaintainerLatency = factorTime.GetTime();
    factorTime.Reset();
    //Ends the NetScore timer and sends the time to the ranker
    ranker.SetNetScoreLatency = totalTime.GetTime();
    totalTime.Reset();
    TestOutput_1.SendToOutput.writeToStdout({ URL: ranker.GetURL, NetScore: ranker.GetNetScore, NetScore_Latency: ranker.GetNetScoreLatency,
        RampUp: ranker.GetRampUp, RampUp_Latency: ranker.GetRampUpLatency, Correctness: ranker.GetCorrectness, Correctness_Latency: ranker.GetCorrectnessLatency,
        BusFactor: ranker.GetBusFactor, BusFactor_Latency: ranker.GetBusFactorLatency, ResponsiveMaintainer: ranker.GetResponsiveMaintainer, ResponsiveMaintainer_Latency: ranker.GetResponsiveMaintainerLatency,
        License: ranker.GetLicense, Liscense_Latency: ranker.GetLicenseLatency });
    ranker.Clear();
}
//Read Input
const fileLocation = process.argv[2]; //Gives argument three, which *should* be the file location
//console.log('File Path:',fileLocation);   
//Outputs file
fs.stat(fileLocation, (err, stats) => {
    if (stats.isFile() == true) {
        const parser = new TestParser_1.UrlProcessor();
        parser.processUrlsFromFile(fileLocation, ProcessURL);
    }
    else {
        console.log('\nNot a File');
        process.exit(1);
    }
    //close error things etc etc    
});
//output is pure string
//Get URLs
//FORMAT OF CONSOLE: node Master.js (file string) 
//batch checks for install/test and if not either, runs above command (running this file)
/*
const filePath = path.join(__dirname, 'TestURLs.txt');

*/ 
