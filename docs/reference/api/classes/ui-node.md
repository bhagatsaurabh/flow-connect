# Class: UINode

A <Ref to="./node">node</Ref> can have interactive UI, structured in a hierarchical way using UINodes for showing labels, selectors, toggles, files, sliders, buttons, dials, images, layouts and more.

## Hierarchy

<Hierarchy
  :extend="{name: 'Hooks', link: './hooks'}"
  :implement="[
    {name: 'Events', link: '../interfaces/events.html'},
    {name: 'Renderable', link: '../interfaces/renderable.html'}
  ]"
/>

## Overview

<Overview :data="data" />

## Constructor

::: warning Usage not recommended
For common usages, creating a UINode such as Labels, Selects, Toggles etc. using this constructor is not recommended, use <Ref to="./node#createbutton">Node.create*</Ref> methods instead.
:::

<Method type="constructor">
  <template v-slot:signature>
    new UINode(<strong>node: </strong><em><Ref to="./node">Node</Ref></em>,
    <strong>position: </strong><em><Ref to="./vector">Vector</Ref></em>,
    <strong>type: </strong><em><Ref to="../enums/ui-type">UIType</Ref></em>,
    <strong>options?: </strong><em><Ref to="../interfaces/ui-node-options">UINodeOptions</Ref></em>):
    <em><Ref to="#class-uinode">UINode</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="node"><em><Ref to="./node">Node</Ref></em></Param>
    <Param name="position">
      <em><Ref to="./vector">Vector</Ref></em>
    </Param>
    <Param name="type">
      <em><Ref to="../enums/ui-type">UIType</Ref></em>
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/ui-node-options">UINodeOptions</Ref></em>
  <template v-slot:default-value>

  ```js
  {
    draggable: false,
    zoomable: false,
    visible: true,
    style: {},
    propName: null,
    input: null,
    output: null,
    id: getNewUUID(), // dynamic
    hitColor: null
  }
  ```
  </template>
    </Param>
  </template>
</Method>

## Properties

### children

<Property type="property" name="children">
  <template v-slot:type>
    <em><Ref to="#class-uinode">UINode</Ref>[]</em>
  </template>
</Property>

### draggable

<Property type="property" name="draggable">
  <template v-slot:type>
    <em>boolean</em>
  </template>
</Property>

### height

<Property type="property" name="height">
  <template v-slot:type>
    <em>number</em>
  </template>
</Property>

### id

<Property type="property" name="id">
  <template v-slot:type>
    <em>string</em>
  </template>
  <template v-slot:desc>
    A unique identifier.
  </template>
</Property>

### input

<Property type="property" name="input">
  <template v-slot:type>
    <em><Ref to="./terminal">Terminal</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the input terminal to which this UINode is bound.
  </template>
</Property>

### node

<Property type="property" name="node">
  <template v-slot:type>
    <em><Ref to="./node">Node</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the parent node in which this UINode exists.
  </template>
</Property>

### output

<Property type="property" name="output">
  <template v-slot:type>
    <em><Ref to="./terminal">Terminal</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the output terminal to which this UINode is bound.
  </template>
</Property>

### position

<Property type="property" name="position">
  <template v-slot:type>
    <em><Ref to="./vector">Vector</Ref></em>
  </template>
</Property>

### propName

<Property type="property" name="propName">
  <template v-slot:type>
    <em>string</em>
  </template>
  <template v-slot:desc>
    Name of the <Ref to="./node#state">Node.state</Ref> property to which this UINode's value is bound.
  </template>
</Property>

### renderState

<Property type="property" name="renderState">
  <template v-slot:type>
    <Ref to="../enums/viewport">ViewPort</Ref>
  </template>
  <template v-slot:desc>
    The RenderState of a UINode, used to optimize rendering when UINode's visible surface is inside/outside the screen viewport.
  </template>
</Property>

### style

<Property type="property" name="style">
  <template v-slot:type>
    <em>any</em>
  </template>
</Property>

### type

<Property type="property" name="type">
  <template v-slot:type>
    <em><Ref to="../enums/ui-type">UIType</Ref></em>
  </template>
</Property>

### width

<Property type="property" name="width">
  <template v-slot:type>
    <em>number</em>
  </template>
</Property>

### zoomable

<Property type="property" name="zoomable">
  <template v-slot:type>
    <em>boolean</em>
  </template>
</Property>

## Accessors

### disabled

<Property type="accessor" name="disabled">
  <template v-slot:type>
    <em>number</em>
  </template>
</Property>

### visible

<Property type="accessor" name="visible">
  <template v-slot:type>
    <em>boolean</em>
  </template>
</Property>

## Methods

### append

<Method type="method">
  <template v-slot:signature>
    append(<strong>childs: </strong><em><Ref to="#class-uinode">UINode</Ref> | <Ref to="#class-uinode">UINode</Ref>[]</em>):
    <em>void</em>
  </template>
  <template v-slot:params>
    <Param name="childs"><em><Ref to="#class-uinode">UINode</Ref> | <Ref to="#class-uinode">UINode</Ref>[]</em></Param>
  </template>
  <template v-slot:desc>
    Appends new UINodes as children, this method is only useful for a few UINode types such as <Ref to="./node#ui">Node.ui</Ref>, <Ref to="../nodeui/horizontal-layout">HorizontalLayout</Ref> and <Ref to="../nodeui/stack">Stack</Ref>.
  </template>
</Method>

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

### getProp

<Method type="method">
  <template v-slot:signature>
    getProp():
    <em>any</em>
  </template>
  <template v-slot:desc>
    Returns the value of <Ref to="./node#state">Node.state</Ref> property bound to this UINode.
  </template>
  <template v-slot:return>
    <em>any</em>
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

### query

<Method type="method">
  <template v-slot:signature>
    query(<strong>query: </strong><em>string</em>):
    <em><Ref to="#class-uinode">UINode</Ref>[]</em>
  </template>
  <template v-slot:params>
    <Param name="query">
      <em>string</em>
    </Param>
  </template>
  <template v-slot:desc>
    Runs a simple query on this UINode and returns the resulting UINodes.<br/>
    For e.g. <code>newNode.ui.query('label')</code> returns all childrens whose type is <Ref to="../nodeui/label">Label</Ref>
  </template>
</Method>

### setProp

<Method type="method">
  <template v-slot:signature>
    setProp(<strong>propValue: </strong><em>any</em>):
    <em>void</em>
  </template>
  <template v-slot:params>
    <Param name="propValue">
      <em>any</em>
    </Param>
  </template>
  <template v-slot:desc>
    Sets the value of <Ref to="./node#state">Node.state</Ref> property bound to this UINode.
  </template>
  <template v-slot:return>
    <em>void</em>
  </template>
</Method>

## Events

### update <Icon type="event" /> {#event-update}

<Event type="event">
  <template v-slot:desc>
    When this ui-node is updated.<br/><br/>
    Along with normal render cycles, UINodes also undergo update cycles when Node's or parent UINode's dimension changes.
  </template>
</Event>

### render <Icon type="event" /> {#event-render}

<Event type="event">
  <template v-slot:desc>
    When a single render cycle completes for this ui-node instance.
  </template>
</Event>

<script setup>
import data from '../../../../../reflections/api/classes/ui-node.json';
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
