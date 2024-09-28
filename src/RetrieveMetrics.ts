//Tester file
// Import the getBusFactor function from BusFactor.ts
import {getBusFactor} from './BusFactor';
// Import the function from ResponsiveMaintainer.ts
import {calculateResponsiveMaintainer} from './ResponsiveMaintainer'
// Import the function from ResponsiveMaintainer.ts
import {evaluateCorrectness} from './CorrectnessMetric'
// Import the function from LicenseMetric.ts
import {checkLicenseCompatibility} from './LicenseMetric'


// Example usage of getBusFactor in RetrieveMetrics.ts
async function retrieveMetrics() {
  //Example repo
  const owner = 'git'; 
  const repo = 'git';     

  //console.log(`Calculating bus factor for ${owner}/${repo}...`);

  // Call getBusFactor to calculate and log the bus factor
  //await getBusFactor(owner, repo);

  //await calculateResponsiveMaintainer(owner, repo);

 //console.log(`Calculating Correctness for ${owner}/${repo}...`);
  
  //await evaluateCorrectness(owner, repo);

  console.log(`Figuring out License compatibility for ${owner}/${repo}... `);

  await checkLicenseCompatibility(owner, repo);
}

retrieveMetrics()