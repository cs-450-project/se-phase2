//Promised-based HTTP client to make requests to the GitHub API
import axios from 'axios';
import dotenv from 'dotenv';


//loads environment variables GITHUB_TOKEN from .env file
dotenv.config();

//Retrieves Github Token form .env (environment variable file)
const token = process.env.GITHUB_TOKEN;

const GITHUB_API_BASE_URL = 'https://api.github.com';

  
async function getTestCoverageReport(owner: string, repo: string) {
    try {
      // Search for test coverage report files in the repository
      const response = await axios.get(
        `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents`, // This fetches the contents of the repo
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Look for a coverage file (e.g., coverage.json or coverage.xml)
      const files = response.data;

      //Looks for any files names that have coverage in them
      const coverageFile = files.find((file: any) => file.name.includes('coverage'));
      
      //If there is no converage file
      if (!coverageFile) {
        console.log('No coverage report found in the repository.');
        return null;
      }
  
      // Fetch the contents of the coverage file
      const coverageResponse = await axios.get(coverageFile.download_url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return coverageResponse.data; // Return the content of the coverage report

      
    } catch (error) {

      console.error(`Error fetching coverage report: ${error}`);

      return null;
    }
  }

  //Function to calculate correctness from the coverage report
  interface CoverageData {
    totalTests: number;
    passedTests: number;
  }
  
  //Function that calculates the score
  function calculateCorrectness(coverageReport: CoverageData){
    const { totalTests, passedTests } = coverageReport;

    //If no test exsits 
    if (totalTests === 0) {
      console.log('No tests were run.');
      return 0;
    }
  
    //Calculation
    const passRate = (passedTests / totalTests) * 100;
    console.log(`Test Pass Rate: ${passRate.toFixed(2)}%`);
    return passRate;
  }
  
  // Main function to evaluate correctness of a repository
  export async function evaluateCorrectness(owner: string, repo: string) {
    const coverageReport = await getTestCoverageReport(owner, repo);
  
    if (!coverageReport) {
     // console.log('No coverage report found, cannot calculate correctness.');
      return 0;
    }
  
    // Assuming the report has totalTests and passedTests fields
    calculateCorrectness({
      totalTests: coverageReport.totalTests,
      passedTests: coverageReport.passedTests,
    });
  }
  
  // Example usage (replace with your GitHub owner and repo)
  //evaluateCorrectness('gcovr', 'gcovr');
