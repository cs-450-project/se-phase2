import * as fs from 'fs';

//Output can change easily in a line or two
export const SendToOutput = {
    //This writes to the standard out
    writeToStdout: (data: object) => {
        //Convert the data object to a JSON string
        const output = JSON.stringify(data);
        
        //Write the JSON string followed by a newline to stdout
        console.log(output);
    }
};
/*
SendToOutput.writeToStdout({ URL: "", NetScore: "", NetScore_Latency: "", RampUp: "", RampUp_Latency: "", Correctness: "", Correctness_Latency: "", BusFactor: "", BusFactor_Latency: "", ResponsiveMaintainer: "", ResponsiveMaintainer_Latency: "", License: "", Liscense_Latency: ""});
*/