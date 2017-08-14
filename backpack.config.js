module.exports = {
  webpack: (config) => {
    config.entry.main = '/var/www/debatewithdata/app.js';
    return config;
  },
};
