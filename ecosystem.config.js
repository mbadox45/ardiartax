module.exports = {
  apps: [{
    name: 'KantinFENew-Dev-3033',
    script: 'node_modules/next/dist/bin/next', // Mengarah langsung ke core next
    args: 'dev -p 3033',                       // Menentukan port 3033 untuk mode dev
    watch: true,                               // Memantau perubahan file
    cron_restart: '0 */8 * * *',
    env: {
       NODE_ENV: "development"
    }
  }]
};