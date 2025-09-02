const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:3000',
    specPattern: 'cypress/integration/**/*.js',
    supportFile: 'cypress/support/index.js',
    viewportWidth: 1000,
    viewportHeight: 1000,
    chromeWebSecurity: false,
  },
})
