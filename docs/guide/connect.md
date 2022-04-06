# Connections

Connections are made between <Ref to="/reference/api/classes/terminal">terminals</Ref> using Connectors.
<br/>
A <Ref to="/reference/api/classes/connector">Connector</Ref> virtually "connects" Terminals of two different <Ref to="/reference/api/classes/node">Nodes</Ref>, it also has a reference to the data being passed and both terminals that it connects.

<br/>
Connections can be made interactively by dragging a terminal to another, or using the API.
<br/>
<br/>
<Ref to="/reference/api/classes/terminal#connect">Terminal.connect</Ref>

```js
timerNode.outputs[0].connect(randomNode.inputs[0]);
randomNode.outputs[0].connect(multiplyNode.inputs[0]);
numberSource.outputs[0].connect(multiplyNode.inputs[1]);
multiplyNode.outputs[0].connect(labelNode.inputsUI[0]);
```

<script setup>
  import Ref from "../../../components/api/Ref.vue";
</script>
