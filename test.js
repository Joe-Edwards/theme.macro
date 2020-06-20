const path = require('path');
const pluginTester = require('babel-plugin-tester').default;
const plugin = require('babel-plugin-macros');

pluginTester({
  plugin,
  babelOptions: { filename: __filename },
  tests: [
    { fixture: path.join(__dirname, 'tests', 'valid.js'), snapshot: true, },
    { fixture: path.join(__dirname, 'tests', 'error.js'), error: 'The theme macro at line 4 is not used within a template expression' }
  ],
});
