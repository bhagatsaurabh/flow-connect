# Class: Toggle

<img class="zoomable" alt="Node-ui Toggle example" src="/images/node-ui-toggle-example.png" />

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
For common usages, this constructor is not recommended, use <Ref to="../classes/node#createtoggle">Node.createToggle</Ref> instead.
:::

<Method type="constructor">
  <template v-slot:signature>
    new Toggle(<strong>node: </strong><em><Ref to="../classes/node">Node</Ref></em>,
    <strong>options: </strong><em><Ref to="../interfaces/toggle-options">ToggleOptions</Ref></em>):
    <em><Ref to="#class-toggle">Toggle</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="node"><em><Ref to="../classes/node">Node</Ref></em></Param>
    <Param name="options">
      <em><Ref to="../interfaces/toggle-options">ToggleOptions</Ref></em>
  <template v-slot:default-value>

  ```js
    {
      value: false,
      height: node.style.rowHeight * 1.5,
    }
  ```

  </template>
    </Param>
  </template>
</Method>

## Accessors

### checked

<Property type="accessor" name="checked">
  <template v-slot:type>
    <em>boolean</em>
  </template>
</Property>

## Events

### change <Icon type="event" /> {#event-change}

<Event type="event">
  <template v-slot:desc>
    When the <Ref to="#checked">checked</Ref> value of this Toggle changes.
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
import data from '../../../../../reflections/api/classes/toggle.json';
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
