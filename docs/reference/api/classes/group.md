# Class: Group

Groups multiple <Ref to="./node">nodes</Ref> together.

<img class="zoomable" alt="Group example" src="/images/group-example.png" />

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

### flow

<Property type="property" name="flow">
  <template v-slot:type>
    <em><Ref to="./flow">Flow</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the <Ref to="./flow">Flow</Ref> in which this group exists.
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

### nodes

<Property type="property" name="nodes">
  <template v-slot:type>
    <em><Ref to="./node">Node[]</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to all the <Ref to="./node">nodes</Ref> that are grouped together using this group.
  </template>
  <template v-slot:default>
    <em>[]</em>
  </template>
</Property>

### renderer

<Property type="property" name="renderer">
  <template v-slot:type>
    <em><Ref to="../interfaces/renderer">Renderer</Ref>&lt;<Ref to="#class-group">Group</Ref>, <Ref to="../interfaces/group-render-params">GroupRenderParams</Ref>&gt;</em>
  </template>
  <template v-slot:default>
    <strong><Function class="mr-0p5" /></strong><em>() => null</em>
  </template>
  <template v-slot:desc>
    A <Ref to="../interfaces/renderer">Renderer</Ref> scoped to a single <Ref to="#class-group">Group</Ref> instance.
    <br/><br/>
    Any custom render function specified using this resolver will only affect this instance of Group.
  </template>
</Property>

### style

<Property type="property" name="style">
  <template v-slot:type>
    <em><Ref to="../interfaces/group-style">GroupStyle</Ref></em>
  </template>
  <template v-slot:default>

```js
{
  titleColor: '#000',
  fontSize: '16px',
  font: 'arial'
}
```

  </template>
</Property>

### width

<Property type="property" name="style">
  <template v-slot:type>
    <em>number</em>
  </template>
</Property>

## Accessors

### name

<Property type="accessor" name="name">
  <template v-slot:type>
    <em>string</em>
  </template>
</Property>

### position

<Property type="accessor" name="position">
  <template v-slot:type>
    <em><Ref to="./vector">Vector</Ref></em>
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

### create

<Method type="method-static">
  <template v-slot:signature>
    create(
      <strong>flow: </strong><em><Ref to="./flow">Flow</Ref></em>,
      <strong>position: </strong><em><Ref to="./vector">Vector</Ref></em>,
      <strong>options: </strong><em><Ref to="../interfaces/group-options">GroupOptions</Ref></em>
    ):
    <em><Ref to="./group">Group</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flow"><em><Ref to="./flow">Flow</Ref></em></Param>
    <Param name="position"><em><Ref to="./vector">Vector</Ref></em></Param>
    <Param name="options"><em><Ref to="../interfaces/group-options">GroupOptions</Ref></em></Param>
  </template>
  <template v-slot:return><em><Ref to="#class-group">Group</Ref></em></template>
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
    <em><Ref to="../interfaces/serialized-group">SerializedGroup</Ref></em>
  </template>
  <template v-slot:inherit>
    <Icon valign="bottom" type="implementation" /> of <Ref to="../interfaces/serializable">Serializable</Ref>.<Ref to="../interfaces/serializable#serialize">serialize</Ref>
  </template>
  <template v-slot:return><em><Ref to="../interfaces/serialized-group">SerializedGroup</Ref></em></template>
</Method>

### add

<Method type="method-implementation">
  <template v-slot:signature>
    add(<strong>node: </strong><em><Ref to="./node">Node</Ref></em>):
    <em>boolean</em>
  </template>
  <template v-slot:params>
    <Param name="node"><em><Ref to="./node">Node</Ref></em></Param>
  </template>
  <template v-slot:return><em>boolean</em></template>
</Method>

### remove

<Method type="method-implementation">
  <template v-slot:signature>
    remove(<strong>node: </strong><em><Ref to="./node">Node</Ref></em>):
    <em>boolean</em>
  </template>
  <template v-slot:params>
    <Param name="node"><em><Ref to="./node">Node</Ref></em></Param>
  </template>
  <template v-slot:return><em>boolean</em></template>
</Method>

## Events

### render <Icon type="event" /> {#event-render}

<Event type="event">
  <template v-slot:desc>
    When a single render cycle completes for this group instance.
  </template>
</Event>

<script setup>
import data from '../../../../../reflections/api/classes/group.json';
</script>
