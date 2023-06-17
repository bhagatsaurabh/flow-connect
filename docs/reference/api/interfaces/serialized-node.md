# Interface: SerializedNode

<pre>
{
  hitColor: <Ref to="../types/serialized-color">SerializedColor</Ref>,
  zIndex: number,
  focused: boolean,
  id: string,
  position: <Ref to="./serialized-vector">SerializedVector</Ref>,
  state: Record&lt;string, any&gt;,
  renderState: <Ref to="./render-state">RenderState</Ref>,
  inputs: <Ref to="./serialized-terminal">SerializedTerminal</Ref>[],
  outputs: <Ref to="./serialized-terminal">SerializedTerminal</Ref>[],
  name: string,
  type: string,
  style: <Ref to="./node-style">NodeStyle</Ref>,
  width: number
}
</pre>
