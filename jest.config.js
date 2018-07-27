// Jest configuration docs at https://jestjs.io/docs/en/configuration
// 
const { defaults } = require('jest-config');
module.exports = {
  verbose: true,
  setupFiles: [ '<rootDir>/jest.setup.js', 'jest-localstorage-mock' ]
}
