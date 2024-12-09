require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'acme-registry-production',
      script: './dist/server.js',
      // Add memory management settings
      node_args: '--max-old-space-size=1024', // Allocate 1GB heap per instance
      max_memory_restart: '1.2G',  // Restart if process exceeds 1.2GB
      
      // Adjust clustering for better stability
      instances: '2',  // Start with 2 instances instead of max
      exec_mode: 'cluster',
      
      // Add graceful shutdown
      kill_timeout: 3000,  // Give processes 3 seconds to finish
      wait_ready: true,  // Wait for ready signal
      listen_timeout: 10000,  // Wait 10s for process to boot
      
      // Add error handling
      exp_backoff_restart_delay: 100,  // Exponential backoff for restarts
      
      // Keep your existing environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_PORT: 5432,
        DB_USERNAME: process.env.DB_USERNAME || 'ec2_user',
        DB_DATABASE: process.env.DB_DATABASE || 'package_registry',
        DB_PASSWORD: process.env.DB_PASSWORD,
        GITHUB_TOKEN: process.env.GITHUB_TOKEN,
        API_URL: 'https://api.acmeregistry.xyz'
      }
    }
  ]
};