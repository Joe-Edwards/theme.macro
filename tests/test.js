const path = require('path');
const pluginTester = require('babel-plugin-tester').default;
const plugin = require('babel-plugin-macros');

pluginTester({
  plugin,
  babelOptions: { filename: __filename },
  tests: [
    { fixture: path.join(__dirname, 'simple.js'), snapshot: true, },
    { fixture: path.join(__dirname, 'props.js'), snapshot: true, },
    { fixture: path.join(__dirname, 'nested.js'), snapshot: true, },
    { fixture: path.join(__dirname, 'error.js'), error: 'The theme macro at line 4 is not used within a template expression' }
  ],
});
