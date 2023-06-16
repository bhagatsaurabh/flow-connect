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
See, <Ref to="./flow#addinput">Flow.addInput</Ref> and <Ref to="./flow#addoutput">Flow.addOutput</Ref>.
:::

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

<Method type="method-async">
  <template v-slot:signature>
    serialize(<strong>persist?: </strong><em><Ref to="../interfaces/data-persistence-provider">DataPersistenceProvider</Ref></em>):
    <em>Promise&lt;<Ref to="../interfaces/serialized-tunnel-node">SerializedTunnelNode</Ref>&gt;</em>
  </template>
  <template v-slot:params>
    <Param name="persist"><em><Ref to="../interfaces/data-persistence-provider">DataPersistenceProvider</Ref></em></Param>
  </template>
  <template v-slot:return><em>Promise&lt;<Ref to="../interfaces/serialized-tunnel-node">SerializedTunnelNode</Ref>&gt;</em></template>
</Method>

<script setup>
import data from '../../../../../reflections/api/classes/tunnel-node.json';
</script>
