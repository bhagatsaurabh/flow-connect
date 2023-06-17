# Interface: SerializedFlow

<pre>
{
  version: string,
  id: string,
  name: string,
  rules: <Ref to="./rules">Rules</Ref>,
  ruleColors: <Ref to="./serialized-rule-colors">SerializedRuleColors</Ref>,
  nodes: <Ref to="./serialized-node">SerializedNode</Ref>[],
  groups: <Ref to="./serialized-group">SerializedGroup</Ref>[],
  connectors: <Ref to="./serialized-connector">SerializedConnector</Ref>[],
  inputs: <Ref to="./serialized-tunnel-node">SerializedTunnelNode</Ref>[],
  outputs: <Ref to="./serialized-tunnel-node">SerializedTunnelNode</Ref>[]
}
</pre>
