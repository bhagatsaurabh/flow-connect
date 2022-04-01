# Interface: SerializedFlow

<pre>
{
  id: string,
  name: string,
  rules: <Ref to="./rules">Rules</Ref>,
  terminalColors: Record&lt;string, string&gt;,
  nodes: <Ref to="./serialized-node">SerializedNode</Ref>[],
  groups: <Ref to="./serialized-group">SerializedGroup</Ref>[],
  connectors: <Ref to="./serialized-connector">SerializedConnector</Ref>[],
  inputs: <Ref to="./serialized-tunnel-node">SerializedTunnelNode</Ref>[],
  outputs: <Ref to="./serialized-tunnel-node">SerializedTunnelNode</Ref>[],
  executionGraph: <Ref to="./serialized-graph">SerializedGraph</Ref>
}
</pre>

<script setup>
import Ref from '../../../../../components/api/Ref.vue';
</script>
