const { createMacro, MacroError } = require('babel-plugin-macros');

const THEME = 'theme';
const PROPS = 'props';

const findTemplateExpression = (path) => {
  if (!path.parentPath) {
    return null;
  }
  if (path.parentPath.isTemplateLiteral() && path.parentPath.parentPath.isTaggedTemplateExpression()) {
    return path;
  }
  return findTemplateExpression(path.parentPath);
}

const handleReference = (path, { types: t }) => {
  const templateExpression = findTemplateExpression(path);

  if (!templateExpression) {
    throw new MacroError(`The theme macro at line ${path.node.loc && path.node.loc.start.line} is not used within a tagged template literal`);
  }

  let props;

  // Identify template expressions already in the correct form
  if (templateExpression.isFunction() && templateExpression.get('params.0') && templateExpression.get('params.0').isIdentifier()) {
    props = templateExpression.get('params.0').node;
  } else {
    // Generate a new non-conflicting identifier for props
    props = path.scope.generateUidIdentifier(PROPS);

    // Construct an arrow function from props
    const arrowExpression = t.arrowFunctionExpression([props], templateExpression.node);

    // Replace the old template expression with the new one
    templateExpression.replaceWith(arrowExpression);
  }

  // Replace the current macro identifier with `props.theme`
  path.replaceWith(t.memberExpression(props, t.identifier(THEME)));
};

module.exports = createMacro(({ references, babel }) => {
  references.default.forEach((path) => handleReference(path, babel));
});
