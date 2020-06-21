import theme from '../../theme.macro';

css`${(props) => theme.foo + props.bar + ((props) => theme.baz)()}`
css`${({ theme: t }) => theme.foo + t.bar + ((t) => theme.baz)()}`
