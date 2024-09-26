"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendToOutput = void 0;
//Output can change easily in a line or two
exports.SendToOutput = {
    //This writes to the standard out
    writeToStdout: (data) => {
        //Convert the data object to a JSON string
        const output = JSON.stringify(data);
        //Write the JSON string followed by a newline to stdout
        console.log(output);
    }
};
/*
SendToOutput.writeToStdout({ URL: "", NetScore: "", NetScore_Latency: "", RampUp: "", RampUp_Latency: "", Correctness: "", Correctness_Latency: "", BusFactor: "", BusFactor_Latency: "", ResponsiveMaintainer: "", ResponsiveMaintainer_Latency: "", License: "", Liscense_Latency: ""});
*/ 
//# sourceMappingURL=TestOutput.js.map