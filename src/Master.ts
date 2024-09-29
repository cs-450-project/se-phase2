import { UrlProcessor } from "./TestParser";
import { SendToOutput } from "./TestOutput";
import { Calculate } from "./TestRanker";
import { Timer } from "./Timer";
import {getBusFactor} from './BusFactor';
import {calculateResponsiveMaintainer} from './ResponsiveMaintainer'
import {evaluateCorrectness} from './CorrectnessMetric'
import {checkLicenseCompatibility} from './LicenseMetric'
import * as path from 'path';
import * as fs from 'fs';

function GetRepoInfo(url: string): {owner: string; repo: string} | null{
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);

    if (match) {
        const owner = match[1];
        const repo = match[2];
        return { owner, repo };
    }
    return null; // Return null if the URL doesn't match
}

async function ProcessURL(url: string){
    const ranker = new Calculate();
    const totalTime = new Timer();
    const factorTime = new Timer();
    const repoInfo = GetRepoInfo(url);

    if(repoInfo){

        const { owner, repo } = repoInfo;

        if(owner && repo){
            totalTime.StartTime();
            ranker.SetURL = url;

            factorTime.StartTime();
            //Check Bus Factor
            ranker.SetBusFactor = Number(await getBusFactor(owner, repo));
            ranker.SetBusFactorLatency = factorTime.GetTime();
            factorTime.Reset();

            factorTime.StartTime();
            //Check Correctness
            ranker.SetCorrectness = Number(await evaluateCorrectness(owner, repo));
            ranker.SetCorrectnessLatency = factorTime.GetTime();
            factorTime.Reset();
            
            factorTime.StartTime();
            //Check License
            ranker.SetLicense = Number(await checkLicenseCompatibility(owner, repo));
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
            ranker.SetResponsiveMaintainer = Number(await calculateResponsiveMaintainer(owner, repo));
            ranker.SetResponsiveMaintainerLatency = factorTime.GetTime();
            factorTime.Reset();

            //Ends the NetScore timer and sends the time to the ranker
            ranker.SetNetScoreLatency = totalTime.GetTime();
            totalTime.Reset();
        }
        else{
            console.log("Unable to connecto to repo");
        }
    }
    else{
        console.log("Unable to connecto to repo");
    }

    SendToOutput.writeToStdout({ URL: ranker.GetURL, NetScore: ranker.GetNetScore, NetScore_Latency: ranker.GetNetScoreLatency, 
        RampUp: ranker.GetRampUp, RampUp_Latency: ranker.GetRampUpLatency, Correctness: ranker.GetCorrectness, Correctness_Latency: ranker.GetCorrectnessLatency, 
        BusFactor: ranker.GetBusFactor, BusFactor_Latency: ranker.GetBusFactorLatency, ResponsiveMaintainer: ranker.GetResponsiveMaintainer, ResponsiveMaintainer_Latency: ranker.GetResponsiveMaintainerLatency, 
        License: ranker.GetLicense, License_Latency: ranker.GetLicenseLatency});


    ranker.Clear();
    
}


//Read Input
const fileLocation : string = process.argv[2];     //Gives argument three, which *should* be the file location
//Outputs file
fs.stat(fileLocation, (err, stats) => {
    if (err==null){
        if(stats.isFile()){
        const parser = new UrlProcessor();
        parser.processUrlsFromFile(fileLocation, ProcessURL);
        }
    }
    else{
        console.log('\nNot a File');
        process.exit(1);
    }
    //close error things etc etc    
});
