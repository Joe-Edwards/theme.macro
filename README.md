# theme.macro

A macro using [babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros)
to reduce boilerplate when using [styled-components themes](https://styled-components.com/docs/advanced#theming).

## Example

Using themes in styled-components leads to writing an awful lot of boilerplate functions, which can hinder readibility:

```javascript
import styled from 'styled-components';

const Button = styled.button`
  color: ${props => props.theme.primaryColor};
  border: 1px solid ${props => props.theme.secondaryColor};
`;
```

This macro allows you to write as if you had access to the theme object directly:

```javascript
import styled from 'styled-components';
import theme from 'theme.macro';

const Button = styled.button`
  color: ${theme.primaryColor};
  border: 1px solid ${theme.secondaryColor};
`;
```

## Usage

Install theme-macro:

```sh
npm install theme-macro
```

Add `babel-plugin-macros` to your babel config, for example:

```json
{
  "presets": ["@babel/preset-env", "@babel/preset-react"],
  "plugins": ["babel-plugin-macros", "babel-plugin-styled-components"]
}
```

N.B. Some toolchains will support this out-of-the-box, including Create React App (since v2).

Then you can use the theme export in your styled components as if it were a first class theme object:

```javascript
import styled from 'styled-components';
import theme from 'theme.macro';

export const Button = styled.button`
  color: ${theme.primaryColor};
  border: 1px solid ${theme.secondaryColor};
`;
```

After being processed by babel, this will be transformed into:

```javascript
import styled from 'styled-components';

export const Button = styled.button`
  color: ${(_props) => _props.theme.primaryColor};
  border: 1px solid ${(_props2) => _props2.theme.secondaryColor};
`;
```

## TypeScript

Includes a type declaration that types the macro as a `DefaultTheme` to allow for type-checking of usages.

As indicated in the styled-componts [docs](https://styled-components.com/docs/api#typescript),
you should override the `DefaultTheme` declaration in your app to give you type-safety when accessing theme properties.

## Caveats

### Only applies within template interpolations

The transformation is only applied within a template interpolation and will not work outside of that context:

```javascript
import styled from 'styled-components';
import theme from 'theme.macro';

const color = theme.primaryColor; // MacroError: The theme macro at line 4 is not used within a template expression

export const Button = styled.button`
  color: ${color};
  border: 1px solid ${theme.secondaryColor};
`;
```

### Transformation is local to the nearest template interpolation

The transformation only looks at the nearest template interpolation.

As an example:

```javascript
import styled, { css } from 'styled-components';
import theme from 'theme.macro';

export const Button = styled.button`
  ${props => props.primary
    ? css`color: ${theme.primaryColor}`
    : css`background: ${theme.secondaryColor}`};
`;
```

will be transformed to something like:

```javascript
import styled, { css } from 'styled-components';

export const Button = styled.button`
  ${props => props.primary
    ? css`color: ${(_props) => _props.theme.primaryColor}`
    : css`background: ${(_props2) => _props2.theme.secondaryColor}`};
`;
```

In particular, this means that the inner templates _must_ also use the tagged `css` literal,
if they are plain template strings then it will not work as expected.

### Nesting optimisation

The transformation attempts to reuse any function already in the correct form.

For example:

```javascript
import styled, { css } from 'styled-components';
import theme from 'theme.macro';

export const Button = styled.button`
  color: ${props => props.primary ? theme.primaryColor : theme.secondaryColor}`;
`;
```

will be transformed to:

```javascript
import styled, { css } from 'styled-components';

export const Button = styled.button`
  color: ${props => props.primary ? props.theme.primaryColor : props.theme.secondaryColor}`;
`;
```

However, this is not attempted for functions in a different form, for example using props destructuring:

```javascript
import styled, { css } from 'styled-components';
import theme from 'theme.macro';

export const Button = styled.button`
  color: ${({ primary }) => primary ? theme.primaryColor : theme.secondaryColor}`;
`;
```

will be transformed as:

```javascript
import styled, { css } from 'styled-components';

export const Button = styled.button`
  color: ${(_props) => ({ primary }) => primary ? _props.theme.primaryColor : _props.theme.secondaryColor}`;
`;
```

(Note that this is only an optimisation concern - styled-components will flatten interpolations like this correctly).
