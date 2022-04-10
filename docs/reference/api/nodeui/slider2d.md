# Class: Slider2D

<img class="zoomable" alt="Node-ui 2D slider example" src="/images/node-ui-2d-slider-example.png" />

An XY 2D Slider.

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
For common usages, this constructor is not recommended, use <Ref to="../classes/node#createslider2d">Node.createSlider2D</Ref> instead.
:::

<Method type="constructor">
  <template v-slot:signature>
    new Slider2D(<strong>node: </strong><em><Ref to="../classes/node">Node</Ref></em>,
    <strong>options: </strong><em><Ref to="../interfaces/slider2d-options">Slider2DOptions</Ref></em>):
    <em><Ref to="#class-slider2d">Slider2D</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="node"><em><Ref to="../classes/node">Node</Ref></em></Param>
    <Param name="options">
      <em><Ref to="../interfaces/slider2d-options">Slider2DOptions</Ref></em>
  <template v-slot:default-value>

  ```js
    {
      height: node.style.rowHeight * 4
    }
  ```

  </template>
    </Param>
  </template>
</Method>

## Accessors

### value

<Property type="accessor" name="value">
  <template v-slot:type>
    <em><Ref to="../classes/vector">Vector</Ref></em>
  </template>
</Property>

## Events

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
import data from '../../../../../reflections/api/classes/slider2d.json';
</script>
