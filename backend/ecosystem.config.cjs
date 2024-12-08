require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'acme-registry-production',
      script: './dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_PORT: 5432,
        DB_USERNAME: process.env.DB_USERNAME || 'ec2_user',
        DB_DATABASE: process.env.DB_DATABASE || 'package_registry',
        DB_PASSWORD: process.env.DB_PASSWORD,
        GITHUB_TOKEN: process.env.GITHUB_TOKEN,
        API_URL: 'http://api.acmeregistry.xyz'
      }
    }
  ]
};