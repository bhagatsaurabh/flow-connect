# Class: Container

The root <Ref to="../classes/ui-node">UINode</Ref> rendering just a rectangle based on <Ref to="../classes/node">Node</Ref> dimensions.

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
For common usages, this constructor is not recommended, a Container gets created for every new <Ref to="../classes/node">Node</Ref>, the reference is stored at <Ref to="../classes/node#ui">Node.ui</Ref>.
:::

<Method type="constructor">
  <template v-slot:signature>
    new Container(<strong>node: </strong><em><Ref to="../classes/node">Node</Ref></em>,
    <strong>width: </strong><em>number</em>,
    <strong>options: </strong><em><Ref to="../interfaces/container-options">ContainerOptions</Ref></em>):
    <em><Ref to="#class-container">Container</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="node"><em><Ref to="../classes/node">Node</Ref></em></Param>
    <Param name="width"><em>number</em></Param>
    <Param name="options">
      <em><Ref to="../interfaces/container-options">ContainerOptions</Ref></em>
  <template v-slot:default-value>

  ```js
    {}
  ```

  </template>
    </Param>
  </template>
</Method>

## Properties

### renderResolver

<Property type="property" name="renderResolver">
  <template v-slot:type>
    <em><Ref to="../interfaces/render-resolver">RenderResolver</Ref>&lt;<Ref to="#class-container">Container</Ref>, <Ref to="../interfaces/container-render-params">ContainerRenderParams</Ref>&gt;</em>
  </template>
  <template v-slot:default>
    <strong><Function class="mr-0p5" /></strong><em>() => null</em>
  </template>
  <template v-slot:desc>
    A <Ref to="../interfaces/render-resolver">RenderResolver</Ref> scoped to a single <Ref to="#class-container">Container</Ref> instance.
    <br/><br/>
    Any custom render function specified using this resolver will only affect this instance of Container.
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
import data from '../../../../../reflections/api/classes/container.json';
</script>
