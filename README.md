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
  border-radius: ${props => props.theme.spacing * 2};
`;
```

This macro allows you to write as if you had access to the theme object directly:

```javascript
import styled from 'styled-components';
import theme from 'theme.macro';

const Button = styled.button`
  color: ${theme.primaryColor};
  border: 1px solid ${theme.secondaryColor};
  border-radius: ${theme.spacing * 2};
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

## Why a macro?

The simple case can be solved by creating helper function for commonly extracted theme properties:

```javascript
import styled from 'styled-components';

const colors = {
  primaryColor: props => props.theme.primaryColor,
  secondaryColor: props => props.theme.secondaryColor,
};

export const Button = styled.button`
  color: ${colors.primaryColor};
  border: 1px solid ${colors.secondaryColor};
`;
```

This is quite tedious to construct, particularly for a large theme object.
A more significant drawback is that these helpers cannot be used in expressions:

```javascript
import styled from 'styled-components';

const spacing = {
  basePx: props => props.theme.basePx,
};

export const Button = styled.button`
  padding: ${spacing.basePx};    /* works as expected */
  margin: ${spacing.basePx * 2}; /* does not work - cannot multiply a function! */
`;
```

Using a macro allows us to use the helper freely in complex expressions:

```javascript
import styled from 'styled-components';
import theme from 'theme.macro';

export const Button = styled.button`
  width: ${theme.wide ? '100%' : `${theme.spacing.basePx * 2}px`};
`;
```

## TypeScript

Includes a type declaration that types the macro as a `DefaultTheme` to allow for type-checking of usages.

As indicated in the styled-componts [docs](https://styled-components.com/docs/api#typescript),
you should override the `DefaultTheme` declaration in your app to give you type-safety when accessing theme properties.

## Caveats

### Transformation only works within tagged template literals

Any usage outside of a tagged template literal will produce an error at build time:

```javascript
import styled, { css } from 'styled-components';
import theme from 'theme.macro';

const color = theme.primaryColor;               // MacroError: The theme macro at line 4 is not used within a tagged template literal
const border = `${theme.secondaryColor}`;       // MacroError: The theme macro at line 5 is not used within a tagged template literal
const background = css`${theme.tertiaryColor}`; // OK

export const Button = styled.button`
  color: ${color};
  border: 1px solid ${border};
  background-color: ${background};
`;
```

### Transformation is local to the nearest tagged template literal

Even if it is nested inside another tagged template literal:

```javascript
import styled, { css } from 'styled-components';
import theme from 'theme.macro';

export const Button = styled.button`
  ${props => props.primary
    ? `color: ${theme.primaryColor}`
    : css`background-color: ${theme.secondaryColor}`};
`;
```

will be transformed to something like:

```javascript
import styled, { css } from 'styled-components';

export const Button = styled.button`
  ${props => props.primary
    ? `color: ${props.theme.primaryColor}`
    : css`background-color: ${(_props) => _props.theme.secondaryColor}`};
`;
```

(Noting that plain template literals are ignored)

### Function reuse

The transformation attempts to reuse any function already in the correct form, for example:

#### Simple functions

```javascript
import styled from 'styled-components';
import theme from 'theme.macro';

export const Button = styled.button`
  color: ${props => props.primary ? theme.primaryColor : theme.secondaryColor}`;
`;
```

will be transformed to:

```javascript
import styled from 'styled-components';

export const Button = styled.button`
  color: ${props => props.primary ? props.theme.primaryColor : props.theme.secondaryColor}`;
`;
```

#### Destructuring

It will work with destructuring props as well, provided there is no `...rest` element:

```javascript
import styled from 'styled-components';
import theme from 'theme.macro';

export const Button = styled.button`
  color: ${({ primary }) => primary ? theme.primaryColor : theme.secondaryColor}`;
`;
```

will be transformed as:

```javascript
import styled from 'styled-components';

export const Button = styled.button`
  color: ${({ primary, theme: _theme }) => primary ? _theme.primaryColor : _theme.secondaryColor}`;
`;
```

#### Rest elements

If a `...rest` element is included, it may not be possible to reuse, but this is expected to be rare within styled components:

```javascript
import styled from 'styled-components';
import theme from 'theme.macro';

export const Button = styled.button`
  color: ${({ primary, ...rest }) => primary ? theme.primaryColor : rest.theme.secondaryColor}`;
`;
```

will be transformed as:

```javascript
import styled from 'styled-components';

export const Button = styled.button`
  color: ${(_props) => ({ primary, ...rest }) => primary ? _props.theme.primaryColor : rest.theme.secondaryColor}`;
`;
```

In this case adding `theme` to the destructuring pattern would remove it from `rest`, breaking `rest.theme.secondaryColor`.
Note that this is only an optimisation issue - styled-components will flatten interpolations like this,
so it's still possible to use rest elements if you wish.
