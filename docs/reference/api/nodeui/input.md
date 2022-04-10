# Class: Input

<img class="zoomable" alt="Node-ui Input example" src="/images/node-ui-input-example.png" />

A generic text/number input.

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
For common usages, this constructor is not recommended, use <Ref to="../classes/node#createinput">Node.createInput</Ref> instead.
:::

<Method type="constructor">
  <template v-slot:signature>
    new Input(<strong>node: </strong><em><Ref to="../classes/node">Node</Ref></em>,
    <strong>options: </strong><em><Ref to="../interfaces/input-options">InputOptions</Ref></em>):
    <em><Ref to="#class-input">Input</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="node"><em><Ref to="../classes/node">Node</Ref></em></Param>
    <Param name="options">
      <em><Ref to="../interfaces/input-options">InputOptions</Ref></em>
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
    Reference to the label that is displayed inside Input.
  </template>
</Property>

### inputEl

<Property type="property" name="inputEl">
  <template v-slot:type>
    <em>HTMLInputElement</em>
  </template>
  <template v-slot:desc>
    Reference to the HTML <code>&lt;input&gt;</code> element.
  </template>
</Property>

## Accessors

### value

<Property type="accessor" name="value">
  <template v-slot:type>
    <em>string | number</em>
  </template>
</Property>

## Events

### change <Icon type="event" /> {#event-change}

<Event type="event">
  <template v-slot:desc>
    When <Ref to="#inputel">inputEl</Ref>'s change event triggers.
  </template>
</Event>

### blur <Icon type="event" /> {#event-blur}

<Event type="event">
  <template v-slot:desc>
    When <Ref to="#inputel">inputEl</Ref>'s blur event triggers.
  </template>
</Event>

### input <Icon type="event" /> {#event-input}

<Event type="event">
  <template v-slot:desc>
    When <Ref to="#inputel">inputEl</Ref>'s input event triggers.
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
import data from '../../../../../reflections/api/classes/input.json';
</script>
