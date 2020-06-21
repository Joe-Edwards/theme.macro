const path = require('path');
const pluginTester = require('babel-plugin-tester').default;
const plugin = require('babel-plugin-macros');

pluginTester({
  plugin,
  babelOptions: { filename: __filename },
  title: 'Theme Macro',
  tests: [
    { title: 'Simple', fixture: path.join(__dirname, '__fixtures__', 'simple.js'), snapshot: true, },
    { title: 'Props', fixture: path.join(__dirname, '__fixtures__', 'props.js'), snapshot: true, },
    { title: 'Nesting', fixture: path.join(__dirname, '__fixtures__', 'nested.js'), snapshot: true, },
    { title: 'Different usages', fixture: path.join(__dirname, '__fixtures__', 'usage.js'), snapshot: true, },
    { title: 'Shadowing', fixture: path.join(__dirname, '__fixtures__', 'shadowing.js'), snapshot: true, },
    { title: 'Outside a template literal', fixture: path.join(__dirname, '__fixtures__', 'error.js'), error: 'The theme macro at line 3 is not used within a tagged template literal' },
    { title: 'In an untagged template literal', fixture: path.join(__dirname, '__fixtures__', 'error2.js'), error: 'The theme macro at line 3 is not used within a tagged template literal' }
  ],
});
