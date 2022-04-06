# Sub-Flows

Sub-Flows are nested flows inside a parent <Ref to="/reference/api/classes/flow">Flow</Ref>, rendered as a SubFlowNode.
<br/><br/>
A <Ref to="/reference/api/classes/subflow-node">SubFlowNode</Ref> is a special type of <Ref to="/reference/api/classes/node">Node</Ref> that holds reference to another Flow (a nested flow) and proxies input/output data through its <Ref to="/reference/api/classes/terminal">terminals</Ref> to the inner flow's <Ref to="/reference/api/classes/tunnel-node">TunnelNodes</Ref>.

## Creating a SubFlow

<br/>
<Ref to="/reference/api/classes/flow#addsubflow">Flow.addSubFlow</Ref>

```js
let subFlowNode = flow1.addSubFlow(flow2, new Vector(200, 200));
```

<script setup>
import Ref from "../../../components/api/Ref.vue";
</script>
