# Class: SubFlowNode

A SubFlowNode is a special type of <Ref to="./node">Node</Ref> that holds reference to another <Ref to="./flow">Flow</Ref> (a nested flow) and proxies input/output data through its <Ref to="./terminal">terminals</Ref> to the inner flow's <Ref to="./tunnel-node">TunnelNodes</Ref>.

<img class="zoomable" alt="/Sub-flow node example" src="/images/sub-flow-node-example.png" />

## Hierarchy

<Hierarchy
  :extend="{name: 'Node', link: './node'}"
/>

## Overview

All Properties, Accessors, Methods and Events <Icon type="inherited" class="ml-0p5" /> from <Ref to="./node">Node</Ref>.

<Overview :data="data" />

## Properties

### subFlow

<Property type="property" name="subFlow">
  <template v-slot:type>
    <em><Ref to="./flow">Flow</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the inner sub-flow.
  </template>
</Property>

## Methods

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

### serialize

<Method type="method-async">
  <template v-slot:signature>
    serialize(<strong>persist?: </strong><em><Ref to="../interfaces/data-persistence-provider">DataPersistenceProvider</Ref></em>):
    <em>Promise&lt;<Ref to="../interfaces/serialized-subflow-node">SerializedSubFlowNode</Ref>&gt;</em>
  </template>
  <template v-slot:inherit>
    <Icon valign="bottom" type="implementation" /> of <Ref to="../interfaces/serializable">Serializable</Ref>.<Ref to="../interfaces/serializable#serialize">serialize</Ref>
  </template>
  <template v-slot:return>Promise&lt;<em><Ref to="../interfaces/serialized-subflow-node">SerializedSubFlowNode</Ref></em>&gt;</template>
</Method>

<script setup>
import data from '../../../../../reflections/api/classes/subflow-node.json';
</script>
