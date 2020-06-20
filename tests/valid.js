import theme from '../theme.macro';

`${theme.foo}` // Simple member access
`${theme.foo.bar}` // Nested member access
`${theme.foo[8] + 7}` // Complex expression
`${props => theme.foo + props.bar}` // Expression with props
`${theme.foo + theme.bar}` // Expression with multiple references
