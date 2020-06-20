const { createMacro, MacroError } = require('babel-plugin-macros');

const THEME = 'theme';
const PROPS = 'props';

const findTemplateExpression = (path) => {
  if (!path.parentPath) {
    return null;
    //throw new MacroError('The theme macro may only be used within a template expression');
  }
  if (path.parentPath.isTemplateLiteral()) {
    return path;
  }
  return findTemplateExpression(path.parentPath);
}

const handleReference = (path, { types: t }) => {
  // Generate a non-conflicting identifier for props
  const props = path.scope.generateUidIdentifier(PROPS);

  // Get the path for the templated expression
  const templateExpression = findTemplateExpression(path);

  if (!templateExpression) {
    throw new MacroError(`The theme macro at line ${path.node.loc && path.node.loc.start.line} is not used within a template expression`);
  }

  // Replace the macro identifier with `props.theme`
  path.replaceWith(t.memberExpression(props, t.identifier(THEME)));

  // Construct an arrow function from props
  const arrowExpression = t.arrowFunctionExpression([props], templateExpression.node);

  // Replace the old template expression with the new one
  templateExpression.replaceWith(arrowExpression);
};

module.exports = createMacro(({ references, babel }) => {
  references.default.forEach((path) => handleReference(path, babel));
});
