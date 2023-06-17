# Class: Connector

A Connector virtually "connects" <Ref to="./terminal">Terminals</Ref> of two different <Ref to="./node">Nodes</Ref>, it also has a reference to the data being passed and both terminals that it connects.

## Hierarchy

<Hierarchy
  :extend="{name: 'Hooks', link: './hooks'}"
  :implement="[
    {name: 'Serializable', link: '../interfaces/serializable.html'},
    {name: 'Renderable', link: '../interfaces/renderable.html'}
  ]"
/>

## Overview

<Overview :data="data" />

## Properties

### end

<Property type="property" name="end">
  <template v-slot:type>
    <em><Ref to="./terminal">Terminal</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the end (input) terminal of the <Ref to="#endnode">endNode</Ref>
    <img alt="The end terminal" class="zoomable" src="/images/end-terminal.png" />
  </template>
</Property>

### endNode

<Property type="property" name="endNode">
  <template v-slot:type>
    <em><Ref to="./node">Node</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the end (input) <Ref to="./node">Node</Ref>
    <img alt="The end node" class="zoomable" src="/images/end-node.png" />
  </template>
</Property>

### start

<Property type="property" name="start">
  <template v-slot:type>
    <em><Ref to="./terminal">Terminal</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the start (output) terminal of the <Ref to="#endnode">startNode</Ref>
    <img alt="The start terminal" class="zoomable" src="/images/start-terminal.png" />
  </template>
</Property>

### startNode

<Property type="property" name="startNode">
  <template v-slot:type>
    <em><Ref to="./node">Node</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the start (output) <Ref to="./node">Node</Ref>
    <img alt="The start node" class="zoomable" src="/images/start-node.png" />
  </template>
</Property>

### flow

<Property type="property" name="flow">
  <template v-slot:type>
    <em><Ref to="./flow">Flow</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the <Ref to="./flow">Flow</Ref> in which this connector exists.
  </template>
</Property>

### id

<Property type="property" name="id">
  <template v-slot:type>
    <em>string</em>
  </template>
  <template v-slot:desc>
    A unique identifier
  </template>
</Property>

### renderer

<Property type="property" name="renderer">
  <template v-slot:type>
    <em><Ref to="../interfaces/renderer">Renderer</Ref>&lt;<Ref to="#class-connector">Connector</Ref>, <Ref to="../interfaces/connector-render-params">ConnectorRenderParams</Ref>&gt;</em>
  </template>
  <template v-slot:default>
    <strong><Function class="mr-0p5" /></strong><em>() => null</em>
  </template>
  <template v-slot:desc>
    A <Ref to="../interfaces/renderer">Renderer</Ref> scoped to a single <Ref to="#class-connector">Connector</Ref> instance.
    <br/><br/>
    Any custom render function specified using this resolver will only affect this instance of Connector.
  </template>
</Property>

### style

<Property type="property" name="style">
  <template v-slot:type>
    <em><Ref to="../interfaces/connector-style">ConnectorStyle</Ref></em>
  </template>
  <template v-slot:default>

```js
{
  width: 5,
  color: '#7fff00aa',
  border: true,
  borderColor: 'grey'
}
```

  </template>
</Property>

## Accessors

### data

<Property type="accessor" name="data">
  <template v-slot:type>
    <em>any</em>
  </template>
  <template v-slot:desc>
    The reference to data set by start (input) terminal.
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

<Method type="method-implementation">
  <template v-slot:signature>
    serialize():
    <em><Ref to="../interfaces/serialized-connector">SerializedConnector</Ref></em>
  </template>
  <template v-slot:inherit>
    <Icon valign="bottom" type="implementation" /> of <Ref to="../interfaces/serializable">Serializable</Ref>.<Ref to="../interfaces/serializable#serialize">serialize</Ref>
  </template>
  <template v-slot:return><em><Ref to="../interfaces/serialized-connector">SerializedConnector</Ref></em></template>
</Method>

### create

::: warning Not Recommended
Using the `create` method directly is not recommended as it can lead to unexpected results, use the <Ref to="./terminal">Terminal</Ref>.<Ref to="./terminal#connect">connect()</Ref> method instead
:::

<Method type="method-static">
  <template v-slot:signature>
    create(
      <strong>flow: </strong><em><Ref to="./flow">Flow</Ref></em>,
      <strong>start: </strong><em><Ref to="./terminal">Terminal</Ref></em>,
      <strong>end: </strong><em><Ref to="./terminal">Terminal</Ref></em>,
      <strong>options: </strong><em><Ref to="../interfaces/connector-options">ConnectorOptions</Ref></em>
    ):
    <em><Ref to="./connector">Connector</Ref></em>
  </template>
  <template v-slot:return><em><Ref to="./connector">Connector</Ref></em></template>
</Method>

## Events

### data <Icon type="event" /> {#event-data}

<Event type="event">
  <template v-slot:desc>
    When the start (input) <Ref to="./terminal">Terminal</Ref> sets/changes data on the connector.
  </template>
</Event>

### render <Icon type="event" /> {#event-render}

<Event type="event">
  <template v-slot:desc>
    When a single render cycle completes for this connector instance.
  </template>
</Event>

<script setup>
import data from '../../../../../reflections/api/classes/connector.json';
</script>
