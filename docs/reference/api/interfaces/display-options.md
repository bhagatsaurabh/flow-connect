# Interface: DisplayOptions

## Hierarchy

<Hierarchy
  :extend="{name: 'UINodeOptions', link: './ui-node-options'}"
/>

<pre>
{
  height: number,
  customRenderers: <Ref to="./custom-renderer-config">CustomRendererConfig</Ref>[],
  clear?: boolean | <Ref to="./serialized-terminal">SerializedTerminal</Ref>
}
</pre>
