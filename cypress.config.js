const { defineConfig } = require('cypress');

const config = defineConfig({
  chromeWebSecurity: false,
  viewportWidth: 1000,
  viewportHeight: 1000,
  e2e: {
    baseUrl: 'http://127.0.0.1:3000',
    supportFile: false
  },
})

module.exports = config;