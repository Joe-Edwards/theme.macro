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
};

// When reusing identifiers, we need to make sure they have not been shadowed where the macro is used
// If they have, we can rename the identifier to avoid a clash
const renameIfShadowed = (path, identifier) => {
  if (path.scope.getBindingIdentifier(identifier.node.name) !== identifier.node) {
    identifier.scope.rename(identifier.node.name);
  }
};

const getThemeExpression = (path, templateExpression, t) => {

  // If the template is already a function then we may be able to reuse it rather than wrapping
  if (templateExpression.isFunction()) {
    const propsParam = templateExpression.get('params.0');

    // No-arg function
    if (!propsParam) {
      // Generate a new non-conflicting identifier for props
      const propsExpression = path.scope.generateUidIdentifier(PROPS);

      // Add as a new argument
      templateExpression.node.params.push(propsExpression);

      // Theme accessed as `props.theme`
      return t.memberExpression(propsExpression, t.identifier(THEME));
    }

    // Function with a simple identifer for props
    if (propsParam.isIdentifier()) {
      renameIfShadowed(path, propsParam);

      // Theme accessed as `props.theme`
      return t.memberExpression(propsParam.node, t.identifier(THEME));
    }

    // Function with destructured props
    if (propsParam.isObjectPattern()) {
      // Find theme property destructured as an identifier
      const themeProperty = propsParam.get('properties').find(p =>
        p.isObjectProperty()
        && p.get('key').isIdentifier() && p.get('key').node.name === THEME
        && p.get('value').isIdentifier()
      );

      // Theme is already destructured with an identifier - reuse it
      if (themeProperty) {
        const themeIdentifier = themeProperty.get('value');
        renameIfShadowed(path, themeIdentifier);

        // Theme accessed as existing identifier
        return themeIdentifier;
      }

      // Props has no rest element - safe to add a new identifier for theme
      if (!propsParam.get('properties').some(p => p.isRestElement())) {
        // Generate a new non-conflicting identifier for theme
        const themeIdentifier = path.scope.generateUidIdentifier(THEME);

        // Add as new property
        propsParam.node.properties.push(t.objectProperty(t.identifier(THEME), themeIdentifier));

        // Theme accessed using new identifier
        return themeIdentifier;
      }
    }
  }

  // No reusable function: wrap the template expression in a new arrow function

  // Generate a new non-conflicting identifier for props
  const propsExpression = path.scope.generateUidIdentifier(PROPS);

  // Construct an arrow function from props
  const arrowExpression = t.arrowFunctionExpression([propsExpression], templateExpression.node);

  // Replace the old template expression with the new one
  templateExpression.replaceWith(arrowExpression);

  // Theme accessed as `props.theme`
  return t.memberExpression(propsExpression, t.identifier(THEME));
}

const handleReference = (path, t) => {
  const templateExpression = findTemplateExpression(path);

  if (!templateExpression) {
    throw new MacroError(`The theme macro at line ${path.node.loc && path.node.loc.start.line} is not used within a tagged template literal`);
  }

  const themeExpression = getThemeExpression(path, templateExpression, t);

  // Replace the current macro identifier with the theme expression
  path.replaceWith(themeExpression);
};

module.exports = createMacro(({ references, babel: { types: t } }) => {
  references.default.forEach((path) => handleReference(path, t));
});
