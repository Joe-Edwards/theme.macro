import theme from '../../theme.macro';

css`${theme.foo}`
css`${theme.foo.bar}`
css`${theme.foo[8] + 7}`
css`${bar(theme.foo)}`
css`${theme.foo + theme.bar}`
