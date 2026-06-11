module.exports = {
  apps : [{
    name: 'Ardiartax (3033/tcp)',
    script: "npx",
    args: "next dev -p 3033",
    watch: true,
    cron_restart: '0 */8 * * *',
    env: {
       NODE_ENV: "development"
    },
    env_production: {
       NODE_ENV: "production"
    }
  }]
};
