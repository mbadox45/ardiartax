module.exports = {
  apps : [{
    name: 'Ardiartax (3033/tcp)',
    script: "npm",
    args: "run dev",
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
