const { createMacro, MacroError } = require('babel-plugin-macros');

const THEME = 'theme';
const PROPS = 'props';

// Record of all template paths that have been transformed, and the props identifier used
const transformedTemplates = [];

const findTemplatePath = (path) => {
  if (!path.parentPath) {
    return null;
  }
  if (path.parentPath.isTemplateLiteral()) {
    return path;
  }
  return findTemplatePath(path.parentPath);
}

const handleReference = (path, { types: t }) => {
  const templatePath = findTemplatePath(path);

  if (!templatePath) {
    throw new MacroError(`The theme macro at line ${path.node.loc && path.node.loc.start.line} is not used within a template expression`);
  }

  let template = transformedTemplates.find(template => template.path === templatePath);

  if (!template) {
    // Generate a new non-conflicting identifier for props
    template = { path: templatePath, props: path.scope.generateUidIdentifier(PROPS) };

    // Construct an arrow function from props
    const arrowExpression = t.arrowFunctionExpression([template.props], templatePath.node);

    // Replace the old template expression with the new one
    templatePath.replaceWith(arrowExpression);

    transformedTemplates.push(template);
  }

  // Replace the current macro identifier with `props.theme`
  path.replaceWith(t.memberExpression(template.props, t.identifier(THEME)));
};

module.exports = createMacro(({ references, babel }) => {
  references.default.forEach((path) => handleReference(path, babel));
});
