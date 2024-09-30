/*
 * Install.ts
 * 
 * Description:
 * This file sends output to the standard out. It is expandable or changable to easily change the output if necessary
 * 
 * Author: Jacob Esparza
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */

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