# Class: Flow

A Flow is a set of <Ref to="./node">Nodes</Ref>, <Ref to="./connector">Connectors</Ref> and <Ref to="./group">Groups</Ref>, it can also contain <Ref to="./sub-flow-node">SubFlowNodes</Ref>.

<img class="zoomable" alt="Example Flow" src="/images/example-flow.png" />

## Hierarchy

<Hierarchy
  :extend="{name: 'Hooks', link: './hooks'}"
  :implement="[{name: 'Serializable', link: '../interfaces/serializable.html'}]"
/>

## Overview

<Overview :data="data" />

## Properties

### connectors

<Property type="property" name="connectors">
  <template v-slot:type>
    <em>Map&lt;string, <Ref to="./connector">Connector</Ref>&gt;</em>
  </template>
  <template v-slot:desc>
    Collection of all connectors a flow has.<br/>
    Keys are <Ref to="./connector#id">Connector.id</Ref>.
  </template>
</Property>

### executionGraph

<Property type="property" name="executionGraph">
  <template v-slot:type>
    <em><Ref to="./graph">Graph</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the graph that executes nodes in order.
  </template>
</Property>

### flowConnect

<Property type="property" name="flowConnect">
  <template v-slot:type>
    <em><Ref to="./flow-connect">FlowConnect</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the FlowConnect instance from which this flow was created.
  </template>
</Property>

### globalEvents

<Property type="property" name="globalEvents">
  <template v-slot:type>
    <em><Ref to="./hooks">Hooks</Ref></em>
  </template>
  <template v-slot:desc>
    A general purpose global event bus.
  </template>
</Property>

### groups

<Property type="property" name="groups">
  <template v-slot:type>
    <em>Map&lt;string, <Ref to="./group">Group</Ref>&gt;</em>
  </template>
  <template v-slot:desc>
    Collection of all the groups in this flow.<br/>
    Keys are <Ref to="./group#id">Group.id</Ref>.
  </template>
</Property>

### id

<Property type="property" name="id">
  <template v-slot:type>
    <em>string</em>
  </template>
  <template v-slot:desc>
    A unique identifier.
  </template>
</Property>

### inputs

<Property type="property" name="inputs">
  <template v-slot:type>
    <em><Ref to="./tunnel-node">TunnelNode</Ref>[]</em>
  </template>
  <template v-slot:desc>
    Collection of all the inputs for this flow.<br/><br/>
    A flow can recieve inputs from another flow via these special nodes acting as proxies between two different flows.
  </template>
</Property>

### name

<Property type="property" name="name">
  <template v-slot:type>
    <em>string</em>
  </template>
</Property>

### nodes

<Property type="property" name="inputs">
  <template v-slot:type>
    <em>Map&lt;string, <Ref to="./node">Node</Ref>&gt;</em>
  </template>
  <template v-slot:desc>
    Collection of all the nodes of this flow (except <Ref to="#inputs">inputs</Ref> and <Ref to="#output">outputs</Ref>).<br/>
    Keys are <Ref to="./node#id">Node.id</Ref>.
  </template>
</Property>

### outputs

<Property type="property" name="outputs">
  <template v-slot:type>
    <em><Ref to="./tunnel-node">TunnelNode</Ref>[]</em>
  </template>
  <template v-slot:desc>
    Collection of all the outputs for this flow.<br/><br/>
    A flow can provide outputs to another flow via these special nodes acting as proxies between two different flows.
  </template>
</Property>

### parentFlow

<Property type="property" name="parentFlow">
  <template v-slot:type>
    <em><Ref to="#class-flow">Flow</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the parent flow (if this is a sub-flow)
  </template>
</Property>

### renderers

<Property type="property" :extras="['readonly']" name="renderers">
  <template v-slot:type>
    <em><Ref to="../interfaces/flow-renderers">FlowRenderers</Ref></em>
  </template>
  <template v-slot:desc>
  A map of <Ref to="../interfaces/renderer">Renderer</Ref> which is scoped to the Flow instance.

Any custom render functions specified using this resolver will affect everything inside this <Ref to="./flow">Flow</Ref> instance.
</template>
<template v-slot:default>{}</template>
</Property>

### rules

<Property type="property" name="rules">
  <template v-slot:type>
    <em><Ref to="../interfaces/rules">Rules</Ref></em>
  </template>
  <template v-slot:desc>
    Specifies what terminal data types can be connected to one another.<br/><br/>
    Also see, <Ref to="./flow-connect#createflow">FlowConnect.createFlow</Ref>.
  </template>
</Property>

### ruleColors

<Property type="property" name="ruleColors">
  <template v-slot:type>
    <em><Ref to="../interfaces/rule-colors">RuleColors</Ref></em>
  </template>
  <template v-slot:desc>
    Map of colors corresponding to data types specified in <Ref to="#rules">rules</Ref>
  </template>
</Property>

## Accessors

### state

<Property type="accessor" :extras="['readonly']" name="flow">
  <template v-slot:type>
    <em><Ref to="../enums/flow-state">FlowState</Ref></em>
  </template>
  <template v-slot:desc>
    The current state of the flow.
  </template>
</Property>

## Methods

### addInput

<Method type="method">
  <template v-slot:signature>
    addInput(<strong>name: </strong><em>string</em>,
    <strong>dataType: </strong><em>string</em>,
    <strong>position</strong><em>: <Ref to="./vector">Vector</Ref></em>):
    <em><Ref to="./tunnel-node">TunnelNode</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="name"><em>string</em></Param>
    <Param name="dataType"><em>string</em></Param>
    <Param name="position"><em><Ref to="./vector">Vector</Ref></em></Param>
  </template>
  <template v-slot:desc>
    Adds a new input to flow.
  </template>
   <template v-slot:return>
    <em><Ref to="./tunnel-node">TunnelNode</Ref></em>
  </template>
  <template v-slot:example>
    <img class="zoomable" alt="add-input-example" src="/images/add-input-example.png" />
  </template>
</Method>

### addOutput

<Method type="method">
  <template v-slot:signature>
    addOutput(<strong>name: </strong><em>string</em>,
    <strong>dataType: </strong><em>string</em>,
    <strong>position</strong><em>: <Ref to="./vector">Vector</Ref></em>):
    <em><Ref to="./tunnel-node">TunnelNode</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="name"><em>string</em></Param>
    <Param name="dataType"><em>string</em></Param>
    <Param name="position"><em><Ref to="./vector">Vector</Ref></em></Param>
  </template>
  <template v-slot:desc>
    Adds a new output to flow.
  </template>
   <template v-slot:return>
    <em><Ref to="./tunnel-node">TunnelNode</Ref></em>
  </template>
  <template v-slot:example>
    <img class="zoomable" alt="add-output-example" src="/images/add-output-example.png" />
  </template>
</Method>

### addSubFlow

<Method type="method">
  <template v-slot:signature>
    addSubFlow(<strong>flow: </strong><em><Ref to="#class-flow">Flow</Ref></em>,
    <strong>position</strong><em>: <Ref to="./vector">Vector</Ref></em>):
    <em><Ref to="./subflow-node">SubFlowNode</Ref></em>
  </template> 
  <template v-slot:params>
    <Param name="flow"><em><Ref to="#class-flow">Flow</Ref></em></Param>
    <Param name="position"><em><Ref to="./vector">Vector</Ref></em></Param>
  </template>
  <template v-slot:desc>
    Adds another flow as a sub-flow.
  </template>
   <template v-slot:return>
    <em><Ref to="./subflow-node">SubFlowNode</Ref></em>
  </template>
  <template v-slot:example>
    <img class="zoomable" alt="add-sub-flow-example" src="/images/add-sub-flow-example.png" />
  </template>
</Method>

### call

<Method type="method-inherited">
  <template v-slot:signature>
    call(<strong>eventKey: </strong><em>string</em>, <strong>...args: </strong><em>any</em>):
    <em>void</em>
  </template>
  <template v-slot:inherit>
    <Icon type="inherited" />from <Ref to="./hooks">Hooks</Ref>.<Ref to="./hooks#call">call</Ref>
  </template>
</Method>

### create

<Method type="method-static">
  <template v-slot:signature>
    create(
      <strong>flowConnect: </strong><em><Ref to="./flow-connect">FlowConnect</Ref></em>,
      <strong>options: </strong><em><Ref to="../interfaces/flow-options">FlowOptions</Ref></em>
    ):
    <em><Ref to="./flow">Flow</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flowConnect"><em><Ref to="./flow-connect">FlowConnect</Ref></em></Param>
    <Param name="options"><em><Ref to="../interfaces/flow-options">FlowOptions</Ref></em></Param>
  </template>
  <template v-slot:return>
    <em><Ref to="./flow">Flow</Ref></em>
  </template>
</Method>

### createNode

<Method type="method">
  <template v-slot:signature>
    createNode&lt;T extends <Ref to="./node">Node</Ref>&gt;(<strong>type: </strong><em>string</em>,
    <strong>position: </strong><em><Ref to="./vector">Vector</Ref></em>,
    <strong>options: </strong><em><Ref to="../interfaces/node-options">NodeOptions</Ref></em>):
    <em>T</em>
  </template>
  <template v-slot:params>
    <Param name="type"><em>string</em></Param>
    Type of the node to create, can be either built-in types such as <code>core/empty</code> or custom plugins such as <code>common/timer</code>
    <Param name="position"><em><Ref to="./vector">Vector</Ref></em></Param>
    <Param name="options"><em><Ref to="../interfaces/node-options">NodeOptions</Ref></em></Param>
  </template>
  <template v-slot:desc>
    Creates and adds a new <Ref to="./node">Node</Ref> to the flow.
  </template>
  <template v-slot:return>
    <em><Ref to="./node">Node</Ref></em>
  </template>
  <template v-slot:example>

```js
let node = flow.createNode("core/empty", Vector.create(50, 50), {
  name: "Test Node",
  width: 250,
  inputs: [
    { name: "A", dataType: "a" },
    { name: "B", dataType: "b" },
  ],
  outputs: [{ name: "C", dataType: "c" }],
  state: {
    labelText: "Label Text",
    sliderValue: 50,
    toggle: false,
  },
  style: {
    padding: 10,
    spacing: 10,
  },
});
```

  </template>
</Method>

### off

<Method type="method-inherited">
  <template v-slot:signature>
    off(<strong>eventKey: </strong><em>string</em>, <strong>id: </strong><em>number</em>):
    <em>void</em>
  </template>
  <template v-slot:inherit>
    <Icon type="inherited" />from <Ref to="./hooks">Hooks</Ref>.<Ref to="./hooks#off">off</Ref>
  </template>
</Method>

### offAll

<Method type="method-inherited">
  <template v-slot:signature>
    offAll():
    <em>void</em>
  </template>
  <template v-slot:inherit>
    <Icon type="inherited" />from <Ref to="./hooks">Hooks</Ref>.<Ref to="./hooks#offall">offAll</Ref>
  </template>
</Method>

### on

<Method type="method-inherited">
  <template v-slot:signature>
    on(<strong>eventKey: </strong><em>string</em>, <strong>callback: </strong><em>(...args: any) => void</em>):
    <em>number</em>
  </template>
  <template v-slot:inherit>
    <Icon type="inherited" />from <Ref to="./hooks">Hooks</Ref>.<Ref to="./hooks#on">on</Ref>
  </template>
  <template v-slot:desc>
    <br/>
    See <Ref to="#events">Events</Ref>.
  </template>
</Method>

### removeNode

<Method type="method">
  <template v-slot:signature>
    removeNode(<strong>nodeOrId: </strong><em>string | <Ref to="./node">Node</Ref></em>):
    <em>void</em>
  </template>
  <template v-slot:params>
    <Param name="nodeOrId">
      <em>string | <Ref to="./node">Node</Ref></em><br/>
      Reference to a node or its <Ref to="./node#id">Node.id</Ref>.
    </Param>
  </template>
  <template v-slot:desc>
    Removes a node from the flow.
  </template>
</Method>

### removeSubFlow

<Method type="method">
  <template v-slot:signature>
    removeSubFlow(<strong>subFlow: </strong><em><Ref to="./flow">Flow</Ref></em>):
    <em>void</em>
    <br/>
    <br/>
    removeSubFlow(<strong>subFlowNode: </strong><em><Ref to="./subflow-node">SubFlowNode</Ref></em>):
    <em>void</em>
  </template>
  <template v-slot:params>
    <Param name="subFlow">
      <em><Ref to="./flow">Flow</Ref></em>
    </Param>
    <Param name="subFlowNode">
      <em><Ref to="./subflow-node">SubFlowNode</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Removes a subflow and its corresponding <Ref to="./subflow-node">SubFlowNode</Ref> from the flow.
  </template>
</Method>

### removeConnector

<Method type="method">
  <template v-slot:signature>
    removeConnector(<strong>id: </strong><em>string</em>):
    <em>void</em>
  </template>
  <template v-slot:params>
    <Param name="id">
      <em>string</em>
    </Param>
  </template>
</Method>

### serialize

<Method type="method-async">
  <template v-slot:signature>
    serialize(<strong>persist?: </strong><em><Ref to="../interfaces/data-persistence-provider">DataPersistenceProvider</Ref></em>):
    <em>Promise&lt;<Ref to="../interfaces/serialized-flow">SerializedFlow</Ref>&gt;</em>
  </template>
  <template v-slot:params>
    <Param name="persist?">
      <em><Ref to="../interfaces/data-persistence-provider">DataPersistenceProvider</Ref></em>
    </Param>
  </template>
  <template v-slot:inherit>
    <Icon valign="bottom" type="implementation" /> of <Ref to="../interfaces/serializable">Serializable</Ref>.<Ref to="../interfaces/serializable#serialize">serialize</Ref>
  </template>
  <template v-slot:return><em>Promise&lt;<Ref to="../interfaces/serialized-flow">SerializedFlow</Ref>&gt;</em></template>
</Method>

### start

<Method type="method">
  <template v-slot:signature>
    start():
    <em>void</em>
  </template>
  <template v-slot:desc>
    Starts execution of flow.
  </template>
</Method>

### stop

<Method type="method">
  <template v-slot:signature>
    stop():
    <em>void</em>
  </template>
  <template v-slot:desc>
    Stops execution of flow.
  </template>
</Method>

### deSerialize

<Method type="method-static-async">
  <template v-slot:signature>
    deSerialize(<strong>flowConnect: </strong><em><Ref to="./flow-connect">FlowConnect</Ref></em>,
    <strong>data: </strong><em><Ref to="../interfaces/serialized-flow">SerializedFlow</Ref></em>,
    <strong>receive?: </strong><em><Ref to="../interfaces/data-fetch-provider">DataFetchProvider</Ref></em>):
    <em>Promise&lt;<Ref to="#class-flow">Flow</Ref>&gt;</em>
  </template>
  <template v-slot:params>
    <Param name="flowConnect"><em><Ref to="./flow-connect">FlowConnect</Ref></em></Param>
    <Param name="data"><em><Ref to="../interfaces/serialized-flow">SerializedFlow</Ref></em></Param>
    <Param name="receive?"><em><Ref to="../interfaces/data-fetch-provider">DataFetchProvider</Ref></em></Param>
  </template>
  <template v-slot:return><em>Promise&lt;<Ref to="#class-flow">Flow</Ref>&gt;</em></template>
</Method>

## Events

### add-input <Icon type="event" /> {#event-add-input}

<Event type="event">
  <template v-slot:desc>
    When a new input gets added to the flow using <Ref to="#addinput">addInput</Ref>.
  </template>
</Event>

### add-output <Icon type="event" /> {#event-add-output}

<Event type="event">
  <template v-slot:desc>
    When a new output gets added to the flow using <Ref to="#addoutput">addOutput</Ref>.
  </template>
</Event>

### render <Icon type="event" /> {#event-render}

<Event type="event">
  <template v-slot:desc>
    When a single render cycle completes for this flow.
  </template>
</Event>

### start <Icon type="event" /> {#event-start}

<Event type="event">
  <template v-slot:desc>
    When the flow starts executing.
  </template>
</Event>

### stop <Icon type="event" /> {#event-stop}

<Event type="event">
  <template v-slot:desc>
    When the flow stops executing.
  </template>
</Event>

<script setup>
import data from '../../../../../reflections/api/classes/flow.json';
</script>
