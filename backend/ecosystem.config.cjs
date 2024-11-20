require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'acme-registry-development',
      script: './dist/server.js',
      instances: 1, // Auto-detects the number of CPUs
      exec_mode: 'fork', // Enables fork mode for simplicity
      env: {
        NODE_ENV: 'development', // Database configs may vary when running locally, add them to your .env
        PORT: 3001,
	DB_HOST: process.env.DB_HOST || 'localhost',
	DB_PORT: process.env.DB_PORT || 5432,
	DB_USERNAME: process.env.DB_USERNAME || 'ec2_user',
	DB_DATABASE: process.env.DB_DATABASE || 'package_registry_dev',
	DB_PASSWORD: process.env.DB_PASSWORD,
	GITHUB_TOKEN: process.env.GITHUB_TOKEN,
        API_URL: process.env.API_URL || 'http://dev.api.acmeregistry.com'
      },
      watch: true
    },
    {
      name: 'acme-registry-production',
      script: './dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
	DB_HOST: 'localhost',
	DB_PORT: 5432,
	DB_USERNAME: 'ec2_user',
	DB_DATABASE: 'package_registry',
	DB_PASSWORD: process.env.DB_PASSWORD,
	GITHUB_TOKEN: process.env.GITHUB_TOKEN,
        API_URL: 'http://api.acmeregistry.xyz'
      }
    }
  ]
};

