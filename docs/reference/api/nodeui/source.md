# Class: Source

<img class="zoomable" alt="Node-ui Source example" src="/images/node-ui-source-example.png" />

A File input.

## Hierarchy

<Hierarchy
  :extend="{name: 'UINode', link: '../classes/ui-node'}"
  :implement="[
    {name: 'Serializable', link: '../interfaces/serializable.html'}
  ]"
/>

## Overview

All Properties, Accessors, Methods and Events <Icon type="inherited" class="ml-0p5" /> from <Ref to="../classes/ui-node">UINode</Ref>.

<Overview :data="data" />

## Constructor

::: warning Usage not recommended
For common usages, this constructor is not recommended, use <Ref to="../classes/node#createsource">Node.createSource</Ref> instead.
:::

<Method type="constructor">
  <template v-slot:signature>
    new Source(<strong>node: </strong><em><Ref to="../classes/node">Node</Ref></em>,
    <strong>options: </strong><em><Ref to="../interfaces/source-options">SourceOptions</Ref></em>):
    <em><Ref to="#class-source">Source</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="node"><em><Ref to="../classes/node">Node</Ref></em></Param>
    <Param name="options">
      <em><Ref to="../interfaces/source-options">SourceOptions</Ref></em>
  <template v-slot:default-value>

  ```js
    {
      height: node.style.rowHeight * 1.5
    }
  ```

  </template>
    </Param>
  </template>
</Method>

## Properties

### label

<Property type="property" name="label">
  <template v-slot:type>
    <em><Ref to="./label">Label</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the Label used to display filename.
  </template>
</Property>

### accept

<Property type="property" name="accept">
  <template v-slot:type>
    <em>string</em>
  </template>
  <template v-slot:desc>
    The 'accept' string passed to the HTMLInputElement to restrict file types.
  </template>
</Property>

## Accessors

### file

<Property type="accessor" name="file">
  <template v-slot:type>
    <em>File</em>
  </template>
</Property>

## Events

### change <Icon type="event" /> {#event-change}

<Event type="event">
  <template v-slot:desc>
    When <Ref to="#file">file</Ref> of this Source changes.
  </template>
</Event>

### upload <Icon type="event" /> {#event-upload}

<Event type="event">
  <template v-slot:desc>
    When a new file gets uploaded via file select dialog (irrespective of whether the <Ref to="../classes/flow">Flow</Ref> is in Running or Stopped state)
  </template>
</Event>

### over <Icon type="event" /> {#event-over}

<Event type="event">
  <template v-slot:desc>
    When mouse over happens on this ui-node.
  </template>
</Event>

### down <Icon type="event" /> {#event-down}

<Event type="event">
  <template v-slot:desc>
    When touch down or mouse-left down occurs on this ui-node.
  </template>
</Event>


### up <Icon type="event" /> {#event-up}

<Event type="event">
  <template v-slot:desc>
    When touch up or mouse-left up happens on this ui-node.
  </template>
</Event>

### click <Icon type="event" /> {#event-click}

<Event type="event">
  <template v-slot:desc>
    When tap or mouse click happens on this ui-node.
  </template>
</Event>

### drag <Icon type="event" /> {#event-drag}

<Event type="event">
  <template v-slot:desc>
    When touch or mouse drag happens on this ui-node.
  </template>
</Event>

### enter <Icon type="event" /> {#event-enter}

<Event type="event">
  <template v-slot:desc>
    When mouse enter happens on this ui-node.
  </template>
</Event>

### exit <Icon type="event" /> {#event-exit}

<Event type="event">
  <template v-slot:desc>
    When mouse exit happens on this ui-node
  </template>
</Event>

### wheel <Icon type="event" /> {#event-wheel}

<Event type="event">
  <template v-slot:desc>
    When mouse scroll happens on this ui-node.
  </template>
</Event>

<script setup>
import data from '../../../../../reflections/api/classes/source.json';
</script>
