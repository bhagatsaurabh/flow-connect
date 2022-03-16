# Class: Graph

A directed acyclic graph containing references to all <Ref to="./node">Nodes</Ref>, assigns and updates their order of execution at runtime.

## Hierarchy

<Hierarchy
  :implement="[{name: 'Serializable', link: '../interfaces/serializable.html'}]"
/>

## Overview

<Overview :data="data" />

## Constructor

<Method type="constructor">
  <template v-slot:signature>
    new Graph():
    <em><Ref to="#class-graph">Graph</Ref></em>
  </template>
  <template v-slot:return>
    <em><Ref to="#class-graph">Graph</Ref></em>
  </template>
</Method>

## Properties

### dirtyNodes

<Property type="property" name="dirtyNodes">
  <template v-slot:type>
    <em>Map&lt;string, <Ref to="./graph-node">GraphNode</Ref>&gt;</em>
  </template>
  <template v-slot:desc>
    Collection of all the higher-order <Ref to="./graph-node">GraphNodes</Ref> that will be executed in next cycle (mapped to <Ref to="./graph-node#id">GraphNode.id</Ref>).
  </template>
</Property>

### graphNodes

<Property type="property" name="graphNodes">
  <template v-slot:type>
    <em>Map&lt;string, <Ref to="./graph-node">GraphNode</Ref>&gt;</em>
  </template>
  <template v-slot:desc>
    Collection of all the <Ref to=".graph-node">GraphNodes</Ref> mapped to <Ref to="./node#id">Node.id</Ref>.
  </template>
</Property>

### nodes

<Property type="property" name="nodes">
  <template v-slot:type>
    <em><Ref to="./graph-node">GraphNode[][]</Ref></em>
  </template>
  <template v-slot:desc>
    A collection of all the <Ref to="./graph-node">GraphNodes</Ref> grouped and indexed by their <Ref to="./graph-node#order">order</Ref>.<br/>
    For e.g. nodes[0] stores all the <Ref to="./graph-node">GraphNodes</Ref> that has order 0 and so on.
  </template>
</Property>

### state

<Property type="property" name="state">
  <template v-slot:type>
    <em><Ref to="../enums/flow-state">FlowState</Ref></em>
  </template>
  <template v-slot:desc>
    Current state of the <Ref to="./flow">Flow</Ref>.
  </template>
  <template v-slot:default>
    <em><Ref to="../enums/flow-state">FlowState</Ref>.Stopped</em>
  </template>
</Property>

## Methods

### propagate

<Method type="method">
  <template v-slot:signature>
    propagate(<strong>root: </strong><em><Ref to="./node">Node</Ref> | <Ref to="./graph-node">GraphNode</Ref></em>,
    <strong>callback: </strong><em>(node: <Ref to="./node">Node</Ref>) => void</em>):
    <em>void</em>
  </template>
  <template v-slot:params>
    <Param name="root"><em><Ref to="./node">Node</Ref> | <Ref to="./graph-node">GraphNode</Ref></em></Param>
    <Param name="callback"><em><Function class="mr-0p5" /><em>(node: <Ref to="./node">Node</Ref>) => void</em></em></Param>
  </template>
  <template v-slot:return>
    <em>void</em>
  </template>
  <template v-slot:desc>
    Generic breadth-first traverser for <Ref to="#class-graph">Graph</Ref>.
  </template>
</Method>

### debugNode

<Method type="method">
  <template v-slot:signature>
    debugNode(<strong>node: </strong><em><Ref to="./graph-node">GraphNode</Ref></em>,
    <strong>indent: </strong><em>string</em>):
    <em>void</em>
  </template>
  <template v-slot:params>
    <Param name="node"><em><Ref to="./graph-node">GraphNode</Ref></em></Param>
    <Param name="indent"><em>string</em></Param>
  </template>
  <template v-slot:return>
    <em>void</em>
  </template>
</Method>

### debugGraph

<Method type="method">
  <template v-slot:signature>
    debugGraph():
    <em>void</em>
  </template>
  <template v-slot:return>
    <em>void</em>
  </template>
</Method>

### serialize

<Method type="method-implementation">
  <template v-slot:signature>
    serialize():
    <em><Ref to="../interfaces/serialized-graph">SerializedGraph</Ref></em>
  </template>
  <template v-slot:inherit>
    <Icon valign="bottom" type="implementation" /> of <Ref to="../interfaces/serializable">Serializable</Ref>.<Ref to="../interfaces/serializable#serialize">serialize</Ref>
  </template>
  <template v-slot:return><em><Ref to="../interfaces/serialized-graph">SerializedGraph</Ref></em></template>
</Method>

### deSerialize

<Method type="method-static">
  <template v-slot:signature>
    deSerialize(<strong>flow: </strong><em><Ref to="./flow">Flow</Ref></em>,
    <strong>data: </strong><em><Ref to="../interfaces/serialized-graph">SerializedGraph</Ref></em>):
    <em><Ref to="#class-graph">Graph</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flow"><em><Ref to="./flow">Flow</Ref></em></Param>
    <Param name="data"><em><Ref to="../interfaces/serialized-graph">SerializedGraph</Ref></em></Param>
  </template>
  <template v-slot:return><em><Ref to="#class-graph">Graph</Ref></em></template>
</Method>

<script setup>
import data from '../../../../../reflections/api/classes/graph.json';
import Hierarchy from '../../../../../components/api/Hierarchy.vue';
import Overview from '../../../../../components/api/Overview.vue';
import Method from '../../../../../components/api/Method.vue';
import Property from '../../../../../components/api/Property.vue';
import Ref from '../../../../../components/api/Ref.vue';
import Param from '../../../../../components/api/Param.vue';
import Optional from '../../../../../components/api/Optional.vue';
import Function from '../../../../../components/api/Function.vue';
import Icon from '../../../../../components/api/Icon.vue';
import Event from '../../../../../components/api/Event.vue';
</script>
