# ACME Corporation: A Trustworthy Module Registry


Welcome to the Trustworthy Module Registry API! This API is part of the CSCI 450 - Fall 2024 Project Phase 2 and is designed to interact with a package registry for managing and analyzing software modules. Below is a comprehensive guide to the API's capabilities, features, and endpoints.

## Overview

The API provides functionality to:
- Upload, update, retrieve, and manage software packages.
- Perform package-specific operations like rating, cost estimation, and searching by name or regex.
- Reset the registry to its default state.

### Use Cases
1. Software developers can manage and distribute packages.
2. Researchers can evaluate package quality using ratings.
3. Administrators can monitor and reset the system state.

## Endpoints

### Packages Management

1. **Retrieve Packages**
    - **Endpoint:** `/packages`
    - **Method:** `POST`
    - **Description:** Fetch a list of packages based on query parameters.
    - **Parameters:**
        - `offset` (optional): For paginated results.
    - **Request Body:** Array of `PackageQuery` objects.
    - **Response:** List of matching packages with metadata.
    - **Error Codes:** `400`, `413`.

2. **Get Package by ID**
    - **Endpoint:** `/package/{id}`
    - **Method:** `GET`
    - **Description:** Retrieve detailed information about a specific package.
    - **Parameters:**
        - `id` (path): Unique identifier of the package.
    - **Response:** Package metadata and data.
    - **Error Codes:** `400`, `404`.

3. **Create or Ingest Package**
    - **Endpoint:** `/package`
    - **Method:** `POST`
    - **Description:** Upload or ingest a new package.
    - **Request Body:** `PackageData` object.
    - **Response:** Confirmation of package creation with metadata.
    - **Error Codes:** `400`, `409`, `424`.

4. **Update Package**
    - **Endpoint:** `/package/{id}`
    - **Method:** `POST`
    - **Description:** Update the content of an existing package.
    - **Parameters:**
        - `id` (path): Package ID.
    - **Request Body:** Updated package content.
    - **Response:** Updated package metadata.
    - **Error Codes:** `400`, `404`.

5. **Search Packages by Regex**
    - **Endpoint:** `/package/byRegEx`
    - **Method:** `POST`
    - **Description:** Search for packages using regular expressions.
    - **Request Body:** `PackageRegEx` object.
    - **Response:** List of matching packages.
    - **Error Codes:** `400`, `404`.

### Package Insights

1. **Get Package Ratings**
    - **Endpoint:** `/package/{id}/rate`
    - **Method:** `GET`
    - **Description:** Retrieve the computed ratings for a package.
    - **Parameters:**
        - `id` (path): Package ID.
    - **Response:** Detailed package ratings.
    - **Error Codes:** `400`, `404`, `500`.

2. **Get Package Cost**
    - **Endpoint:** `/package/{id}/cost`
    - **Method:** `GET`
    - **Description:** Calculate the total cost of a package, including dependencies if requested.
    - **Parameters:**
        - `id` (path): Package ID.
        - `dependency` (query, optional): Boolean to include dependency costs.
    - **Response:** Cost breakdown.
    - **Error Codes:** `400`, `404`, `500`.

### Administrative Operations

1. **Reset Registry**
    - **Endpoint:** `/reset`
    - **Method:** `DELETE`
    - **Description:** Reset the registry to its default state.
    - **Response:** Confirmation of registry reset.
    - **Error Codes:** `401`, `403`.

2. **Get Implemented Tracks**
    - **Endpoint:** `/tracks`
    - **Method:** `GET`
    - **Description:** Retrieve the list of tracks implemented by the student.
    - **Response:** List of planned tracks.
    - **Error Codes:** `500`.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following tools installed on your machine:

* **Node.js** - LTS version 20.17.0 is recommended
* **npm** - Comes with Node.js
* **GitHub Token** - A personal access token for interacting with the GitHub API
* **Docker/Docker Desktop** - For setting up the PostgreSQL database

### Installation

Follow these steps to install and configure the API:

#### 1. Clone the Repository

Clone the project repository to your local machine:

```bash
git clone https://github.com/cs-450-project/se-phase2.git
```

#### 2. Install Dependencies

Navigate to the project directory and install the required npm dependencies:

```bash
npm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the root directory and populate it with the following configuration:

```plaintext
GITHUB_TOKEN=<your GitHub personal access token>
LOG_LEVEL=1
LOG_FILE=./app.log
NODE_ENV=development
PORT=3000
DB_HOST=172.19.22.130
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=mypassword
DB_DATABASE=package_registry
```

Replace `<your GitHub personal access token>` with your actual GitHub token.

### Setting Up the Database

To run the API, you can configure a PostgreSQL database using Docker:

#### 1. Pull the PostgreSQL Image

Download the latest PostgreSQL Docker image:

```bash
docker pull postgres
```

#### 2. Start the PostgreSQL Container

Run the PostgreSQL container with the following command:

```bash
sudo docker run --name se-phase2-db \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=package-registry \
  -p 5432:5432 \
  -d postgres
```

#### 3. Determine the Database Host (WSL Users)

If you're running this setup on WSL, retrieve the host IP for the database:

```bash
wsl hostname -I
```

Use this IP address for the `DB_HOST` field in your `.env` file.

### Running the API

Once the setup is complete, you can start the API in development mode:

#### 1. Verify Database Status

Ensure the PostgreSQL database is running:

```bash
docker ps
```

#### 2. Start Development Server

Start the API with live reload capabilities:

```bash
npm run dev
```

### Available Commands

The following npm scripts are available for different operations:

```bash
# Run in production mode (compiles TypeScript and starts the application in detatched mode using PM2)
npm run start

# Build the application (compile TypeScript to JavaScript)
npm run build

# Perform static type checking
npm run type-check

# Execute tests using Vitest
npm run test
```

## Frontend Development

### Prerequisites

Before starting development, ensure you have the following installed:

* **Node.js** - Version 18.18.0 or higher (as required by Angular 18)
* **npm** - Latest stable version (comes with Node.js)
* **Angular CLI** - Version 18.2.9 (will be installed via package.json)
* **Chrome/Chromium** - For running tests (required by Karma test runner)

### Installation

Follow these steps to set up the frontend development environment:

#### 1. Install Dependencies

From the project root directory, install all required npm packages:

```bash
npm install
```

This command will install both production and development dependencies, including Angular core libraries, testing frameworks, and development tools.

### Development Server

The application can be run in several modes depending on your needs:

#### Standard Development Mode

Start the application with hot-reload capabilities:

```bash
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200`. Changes to source files will automatically trigger a rebuild and reload.

#### Watch Mode

For development with automatic rebuilds but without serving:

```bash
npm run watch
```

#### Production Build

Create a production-optimized build:

```bash
npm run build
```

The built application will be available in the `dist/` directory.


### Project Structure

Our Angular application follows a modular architecture:

```
src/
├── app/                # Application source code
│   ├── components/    # Reusable UI components
│   ├── services/      # Angular services
│   ├── models/        # TypeScript interfaces/types
│   └── pages/         # Route components
├── assets/            # Static assets
└── environments/      # Environment configurations
```

### Available Scripts

Here's a complete list of available npm scripts:

``` bash
# Start development server
npm start

# Create production build
npm run build

# Build in watch mode
npm run watch

```
## Our Team
- Adeel Habib
- Chloe Humphrey
- Will Kissel
- Yamini Krubha
- Israel Oladeji
- JT Wellspring