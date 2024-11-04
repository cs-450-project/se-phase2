
# ACME Corporation: A Trustworthy Module Registry

Group 4 has taken over Group 3's project from Handoff. Here you will find information necessary for interacting with the system. 

## Getting Started - Phase 1

Metric scores can be calculated from a file containing repository URLs, satisfying the Phase 1 requirements for the project. To get started with this portion of the project, follow the steps below.

### Prerequisites
* Node.js (preferably LTS version 20.17.0)
* npm (Node Package Manager)
* GitHub Token (for accessing the GitHub API)

### Installation
1. Clone the repository to your local machine.
```
git clone https://github.com/cs-450-project/se-phase2.git
```
2. Install the required dependencies using npm or the run bash file:
```
npm install OR ./run install
```
3. Add 📁`logs` folder in the root directory.
4. Add ⚙️`.env` file in the root directory:
```
// Example .env file
GITHUB_TOKEN = '<your GitHub personal access token>'
LOG_LEVEL = 1
LOG_FILE = ./logs/app.log
```

### Running the Program
To evaluate a list of open-source modules:
1. Prepare a file (e.g., `sample-file.txt` already in the project) containing the URLs of the repositories to be evaluated.
2. Execute the program with the following command:
``` 
./run <URL_FILE>
```
Example:
```
./run sample-file.txt
```
This will produce the output with the module scores in NDJSON format.

### Logging
The program supports logging, which can be configured through environment variables:
- LOG_FILE: Specifies the location of the log file.
- LOG_LEVEL: Controls the verbosity of logs (0 = silent, 1 = informational, 2 = debug). By default, the log level is set to 0 (silent).

See example `.env` file above for possible configuration.

## Getting Started - Phase 2

Phase 2 has brought about far more functionality to ACME's package registry system. The API can be started locally with the following steps and set up.

### Prerequisites
* Node.js (preferably LTS version 20.17.0)
* npm (Node Package Manager)
* GitHub Token (for accessing the GitHub API)
* Docker/Docker Desktop

### Installation
1. Clone the repository to your local machine.
```
git clone https://github.com/cs-450-project/se-phase2.git
```
2. Install the required dependencies using npm:
```
npm install
```
3. Add 📁`logs` folder in the root directory.
4. Add ⚙️`.env` file in the root directory:
```
// Example .env file
GITHUB_TOKEN = '<your GitHub personal access token>'
LOG_LEVEL = 1
LOG_FILE = ./logs/app.log

NODE_ENV=dev
PORT=3000

DB_HOST=172.19.22.130
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=mypassword
DB_DATABASE=package_registry
```

### Setting Up the Database
1. Open a terminal and fetch the latest image of PostgreSQL:
```
docker pull postgres
```
2. Start a PostgreSQL contiainer using Docker:
```
sudo docker run --name se-phase2-db -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=package-registry -p 5432:5432 -d postgres
```
3. (if using WSL) Open PowerShell to get the host name for the instance:
```
wsl hostname -I
```

### Serving the API
* Ensure that the Postgres database is live, all dependencies are installed.
* Run in development mode (live reload):
```
npm run dev
```