"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestParser_1 = require("./TestParser");
const TestOutput_1 = require("./TestOutput");
const TestRanker_1 = require("./TestRanker");
const fs = require("fs");
function ProcessURL(url) {
    const ranker = new TestRanker_1.Calculate();
    //Start NetScore Timer
    ranker.SetURL = url;
    //Start BusFactor Timer
    //Check BusFactor
    ranker.SetBusFactor = Math.random() * (30 - 1) + 1;
    //End Timer Bus
    ranker.SetBusFactorLatency = Math.random() * (30 - 1) + 1;
    //Start Timer Correctness
    //Check Correctness
    ranker.SetCorrectness = Math.random() * (30 - 1) + 1;
    //End Timer Correctness
    ranker.SetCorrectnessLatency = Math.random() * (30 - 1) + 1;
    //Start Timer License
    //Check License
    ranker.SetLicense = Math.random() < 0.5 ? 0 : 1;
    //End Timer License
    ranker.SetLicenseLatency = Math.random() * (30 - 1) + 1;
    //Start RampUp Timer
    //Check Rampup
    ranker.SetRampUp = Math.random() * (30 - 1) + 1;
    //End Timer RampUp
    ranker.SetRampUpLatency = Math.random() * (30 - 1) + 1;
    //Start ResponsiveMaintainer Timer
    //Check ResponsiveMaintainer
    ranker.SetResponsiveMaintainer = Math.random() * (30 - 1) + 1;
    //End ResponsiveMaintienr Timer
    ranker.SetResponsiveMaintainerLatency = Math.random() * (30 - 1) + 1;
    //End NetScore timer
    ranker.SetNetScoreLatency = Math.random() * (30 - 1) + 1;
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
    if (stats.isFile()) {
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
