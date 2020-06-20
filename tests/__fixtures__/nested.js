import theme from '../../theme.macro';

css`${props => props.foo && css`${theme.bar}`}`
css`${props => props.foo ? css`${theme.bar}` : css`${theme.baz}`}`
css`${theme.foo ? css`${theme.bar}` : css`${theme.baz}`}`
css`${theme.foo ? `${theme.bar}` : `${theme.baz}`}`
