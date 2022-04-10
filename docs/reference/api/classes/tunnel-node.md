# Class: TunnelNode

A TunnelNode acts as an external input/output interface for a <Ref to="./flow">flow</Ref>.<br/><br/>
For e.g. a nested sub-flow inside a flow might need some input or might produce some output, this is possible through <Ref to="./subflow-node">SubFlowNode</Ref>.<br/>
A SubFlowNode's <Ref to="./terminal">terminals</Ref> are proxied to TunnelNode's terminals.

See <Ref to="./subflow-node">SubFlowNode</Ref>, to understand how TunnelNode is related to nested flows.

## Hierarchy

<Hierarchy
  :extend="{name: 'Node', link: './node'}"
/>

## Overview

All Properties, Accessors, Methods and Events <Icon type="inherited" class="ml-0p5" /> from <Ref to="./node">Node</Ref>.

<Overview :data="data" />

## Constructor

::: tip
Also see, <Ref to="./flow#addinput">Flow.addInput</Ref> and <Ref to="./flow#addoutput">Flow.addOutput</Ref>.
:::

<Method type="constructor">
  <template v-slot:signature>
    new TunnelNode(<strong>flow: </strong><em><Ref to="./flow">Flow</Ref></em>,
    <strong>name: </strong><em>string</em>,
    <strong>position: </strong><em><Ref to="./vector">Vector</Ref></em>,
    <strong>width: </strong><em>number</em>,
    <strong>inputs: </strong><em>any[]</em>,
    <strong>outputs: </strong><em>any[]</em>,
    <strong>options?: </strong><em><Ref to="../interfaces/tunnel-node-options">TunnelNodeOptions</Ref></em>):
    <em><Ref to="#class-tunnelnode">TunnelNode</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flow"><em><Ref to="./flow">Flow</Ref></em></Param>
    <Param name="name">
      <em>string</em>
    </Param>
    <Param name="position">
      <em><Ref to="./vector">Vector</Ref></em>
    </Param>
    <Param name="width">
      <em>number</em>
    </Param>
    <Param name="inputs">
      <em>any[]</em>
    </Param>
    <Param name="outputs">
      <em>any[]</em>
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/tunnel-node-options">TunnelNodeOptions</Ref></em>
  <template v-slot:default-value>

  ```js
  {
    style: {},
    terminalStyle: {},
    state: {}
  }
  ```
  </template>
    </Param>
  </template>
</Method>

## Accessors

::: warning
Avoid creating TunnelNodes manually and thereby setting/modifying this accessor, instead use <Ref to="./flow#addinput">Flow.addInput</Ref>/<Ref to="./flow#addoutput">Flow.addOutput</Ref>
:::

### proxyTerminal

<Property type="accessor" name="proxyTerminal">
  <template v-slot:type>
    <em><Ref to="./terminal">Terminal</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the terminal of <Ref to="./subflow-node">SubFlowNode</Ref>.
  </template>
</Property>

## Methods

### serialize

<Method type="method-implementation">
  <template v-slot:signature>
    serialize():
    <em><Ref to="../interfaces/serialized-tunnel-node">SerializedTunnelNode</Ref></em>
  </template>
  <template v-slot:inherit>
    <Icon valign="bottom" type="implementation" /> of <Ref to="../interfaces/serializable">Serializable</Ref>.<Ref to="../interfaces/serializable#serialize">serialize</Ref>
  </template>
  <template v-slot:return><em><Ref to="../interfaces/serialized-tunnel-node">SerializedTunnelNode</Ref></em></template>
</Method>

### deSerialize

<Method type="method-static">
  <template v-slot:signature>
    deSerialize(<strong>flow: </strong><em><Ref to="./flow">Flow</Ref></em>,
    <strong>data: </strong><em><Ref to="../interfaces/serialized-tunnel-node">SerializedTunnelNode</Ref></em>):
    <em><Ref to="#class-terminal">Terminal</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flow"><em><Ref to="./flow">Flow</Ref></em></Param>
    <Param name="data"><em><Ref to="../interfaces/serialized-tunnel-node">SerializedTunnelNode</Ref></em></Param>
  </template>
  <template v-slot:return><em><Ref to="#class-tunnelnode">TunnelNode</Ref></em></template>
</Method>

<script setup>
import data from '../../../../../reflections/api/classes/tunnel-node.json';
</script>
