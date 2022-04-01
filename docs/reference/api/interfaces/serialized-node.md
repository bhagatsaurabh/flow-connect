# Interface: SerializedNode

<pre>
{
  hitColor: <Ref to="./serialized-color">SerializedColor</Ref>,
  zIndex: number,
  focused: boolean,
  id: string,
  position: <Ref to="./serialized-vector">SerializedVector</Ref>,
  state: Record&lt;string, any&gt;,
  renderState: <Ref to="./render-state">RenderState</Ref>,
  inputs: <Ref to="./serialized-terminal">SerializedTerminal</Ref>[],
  outputs: <Ref to="./serialized-terminal">SerializedTerminal</Ref>[],
  name: string,
  style: <Ref to="./node-style">NodeStyle</Ref>,
  terminalStyle: <Ref to="./terminal-style">TerminalStyle</Ref>,
  ui: <Ref to="./serialized-container">SerializedContainer</Ref>,
  width: number,
  subFlow?: <Ref to="./serialized-flow">SerializedFlow</Ref>
}
</pre>

<script setup>
import Ref from '../../../../../components/api/Ref.vue';
</script>
