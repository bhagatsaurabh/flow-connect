# Class: RadioGroup

<img class="zoomable" alt="Node-ui Radio-group example" src="/images/node-ui-radio-group-example.png" />

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
For common usages, this constructor is not recommended, use <Ref to="../classes/node#createradiogroup">Node.createRadioGroup</Ref> instead.
:::

<Method type="constructor">
  <template v-slot:signature>
    new RadioGroup(<strong>node: </strong><em><Ref to="../classes/node">Node</Ref></em>,
    <strong>values: </strong><em>string[]</em>,
    <strong>selected: </strong><em>string</em>,
    <strong>options: </strong><em><Ref to="../interfaces/radio-group-options">RadioGroupOptions</Ref></em>):
    <em><Ref to="#class-radiogroup">RadioGroup</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="node"><em><Ref to="../classes/node">Node</Ref></em></Param>
    <Param name="values">
      <em>string[]</em>
      <template v-slot:default-value>
        <em>['default']</em>
      </template>
    </Param>
    <Param name="selected">
      <em>string</em>
      <template v-slot:default-value>
        <em>'default'</em>
      </template>
    </Param>
    <Param name="options">
      <em><Ref to="../interfaces/radio-group-options">RadioGroupOptions</Ref></em>
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

## Accessors

### selected

<Property type="accessor" name="selected">
  <template v-slot:type>
    <em>string</em>
  </template>
</Property>

## Events

### change <Icon type="event" /> {#event-change}

<Event type="event">
  <template v-slot:desc>
    When <Ref to="#selected">selected</Ref> value of this RadioGroup changes.
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
import data from '../../../../../reflections/api/classes/radio-group.json';
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
