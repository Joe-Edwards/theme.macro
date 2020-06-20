import theme from '../../theme.macro';

css`${props => theme.foo + props.bar}`
css`${function (props) { theme.foo + props.bar }}`
css`${({ bar }) => theme.foo + bar}`
css`${() => theme.foo}`
