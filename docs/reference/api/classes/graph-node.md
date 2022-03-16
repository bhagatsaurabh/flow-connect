# Class: GraphNode

Accessing all the higher order nodes that are connected to a <Ref to="./node">Node</Ref> is difficult, since it has to be traversed through its <Ref to="./terminal">Terminals</Ref>, and a node can have multiple output terminals connected to multiple input terminals of other nodes.<br/>

To make this graph of nodes in a <Ref to="./flow">Flow</Ref> accesible and feasible to traverse, this class provides a wrapper around <Ref to="./node">Node</Ref> and stores direct references to all the connected <Ref to="./node">Nodes</Ref> as its childs.<br/>

The execution <Ref to="./graph">Graph</Ref> creates and maintains these graph nodes for each <Ref to="./node">Node</Ref> of the <Ref to="./flow">Flow</Ref>.

## Hierarchy

<Hierarchy
  :implement="[{name: 'Serializable', link: '../interfaces/serializable.html'}]"
/>

## Overview

<Overview :data="data" />

## Constructor

<Method type="constructor">
  <template v-slot:signature>
    new GraphNode(flowNode: <em><Ref to="./node">Node</Ref></em>):
    <em><Ref to="#class-graphnode">GraphNode</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flowNode"><em><Ref to="./node">Node</Ref></em></Param>
  </template>
  <template v-slot:return>
    <em><Ref to="#class-graphnode">GraphNode</Ref></em>
  </template>
</Method>

## Properties

### childs

<Property type="property" name="childs">
  <template v-slot:type>
    <em><Ref to="./graph-node">GraphNode[]</Ref></em>
  </template>
  <template v-slot:desc>
    References to all the connected higher-order <Ref to="#class-graphnode">GraphNodes</Ref>.
  </template>
  <template v-slot:default>
    <em>[]</em>
  </template>
</Property>

### flowNode

<Property type="property" name="flowNode">
  <template v-slot:type>
    <em><Ref to="./graph-node">Node</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the actual <Ref to="./node">Node</Ref> in a <Ref to="./flow">Flow</Ref>.
  </template>
</Property>

### id

<Property type="property" name="id">
  <template v-slot:type>
    <em>string</em>
  </template>
  <template v-slot:desc>
    Unique identifier for each <Ref to="#class-graphnode">GraphNode</Ref>.
  </template>
</Property>

### order

<Property type="property" name="state">
  <template v-slot:type>
    <em>number</em>
  </template>
  <template v-slot:desc>
    The order of the <Ref to="./node">Node</Ref>.<br/><br/>
    This order gets updated as the structure of the graph (connected nodes in the flow) changes.<br/><br/>
    0<sup>th</sup> order nodes are the nodes that do not have any input, 1<sup>st</sup> order nodes accept inputs from 0<sup>th</sup> order nodes, and so on. This order determines when a node will be processed, nodes get processed from lowest order to highest order.<br/><br/>
    The highest order nodes are the ones that do not produce any output and will execute last.
  </template>
  <template v-slot:default>
    0
  </template>
</Property>

## Methods

### serialize

<Method type="method-implementation">
  <template v-slot:signature>
    serialize():
    <em><Ref to="../interfaces/serialized-graphnode">SerializedGraphNode</Ref></em>
  </template>
  <template v-slot:inherit>
    <Icon valign="bottom" type="implementation" /> of <Ref to="../interfaces/serializable">Serializable</Ref>.<Ref to="../interfaces/serializable#serialize">serialize</Ref>
  </template>
  <template v-slot:return><em><Ref to="../interfaces/serialized-graphnode">SerializedGraphNode</Ref></em></template>
</Method>

### deSerialize

<Method type="method-static">
  <template v-slot:signature>
    deSerialize(<strong>node: </strong><em><Ref to="./node">Node</Ref></em>,
    <strong>data: </strong><em><Ref to="../interfaces/serialized-graphnode">SerializedGraphNode</Ref></em>):
    <em><Ref to="#class-graphnode">GraphNode</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="node"><em><Ref to="./node">Node</Ref></em></Param>
    <Param name="data"><em><Ref to="../interfaces/serialized-graphnode">SerializedGraphNode</Ref></em></Param>
  </template>
  <template v-slot:return><em><Ref to="#class-graphnode">GraphNode</Ref></em></template>
</Method>

<script setup>
import data from '../../../../../reflections/api/classes/graph-node.json';
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
