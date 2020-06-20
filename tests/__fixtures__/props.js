import theme from '../../theme.macro';

const computed = 'theme';

css`${() => theme.foo}`
css`${props => theme.foo + props.bar}`
css`${function (props) { theme.foo + props.bar }}`
css`${({ bar }) => theme.foo + bar}`
css`${({ bar: { baz } }) => theme.foo + baz}`
css`${({ '-bar-': bar }) => theme.foo + bar}`
css`${({ bar, theme: t }) => theme.foo + bar + t.baz}`
css`${({ bar, 'theme': t }) => theme.foo + bar + t.baz}`
css`${({ bar, ...rest }) => theme.foo + bar + rest.baz}`
css`${({ [computed]: bar }) => theme.foo + bar}`
