# Introduction

## What is FlowConnect ?

FlowConnect is a visual programming framework for creating node-based interfaces that are reactive, event-driven, customizable and executable.

An example:

<LiveExample snippet="quick-start">
<template v-slot:name>quick-start.js</template>
<template v-slot:run="props"><LiveRunBasic :play="props.play" /></template>
<template v-slot:code>
<div class="code-block">

@[code](../snippets/quick-start.js)

</div>
</template>
</LiveExample>

<br/><br/>
Learning FlowConnect is as simple as understanding what these terms mean and how they are related: Flows, Nodes, Connectors, Groups and Sub-Flows.<br/><br/>
Every <Ref to="/reference/api/classes/flow-connect">FlowConnect</Ref> instance that you create has one or more Flows, and every <Ref to="/reference/api/classes/flow">Flow</Ref> consists of <Ref to="/reference/api/classes/node">Nodes</Ref>, <Ref to="/reference/api/classes/connector">Connectors</Ref> and <Ref to="/reference/api/classes/group">Groups</Ref><br/><br/>
Flows can also have <Ref to="/reference/api/classes/subflow-node">SubFlows</Ref>.<br/><br/><br/>
To summarise...
* Create a <span class="colored-emphasis">Flow</span>
* Create a bunch of <span class="colored-emphasis">Nodes</span> inside that flow
* Connect those nodes using <span class="colored-emphasis">Connectors</span>
* Group similar nodes together using Node <span class="colored-emphasis">Groups</span>
* If your flow becomes large, create <span class="colored-emphasis">Sub-Flows</span> inside flows

<script setup>
  import LiveRunBasic from '../../../components/home/LiveRunBasic.vue';
  import LiveExample from '../../../components/common/LiveExample.vue';
  import Ref from '../../../components/api/Ref.vue'; 
</script>
