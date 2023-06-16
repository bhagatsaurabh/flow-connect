# Class: Color

A general purpose RGBA color class with a few utility functions.

## Hierarchy

<Hierarchy :implement="[{name: 'Serializable', link: '../interfaces/serializable.html'}]" />

## Overview

<Overview :data="data" />

## Properties

### hexValue

<Property type="property" name="hexValue">
  <template v-slot:type>
    <em>string</em>
  </template>
  <template v-slot:desc>Example: <code>#34488e</code></template>
</Property>

### rgbaCSSString

<Property type="property" name="rgbaCSSString">
  <template v-slot:type>
    <em>string</em>
  </template>
  <template v-slot:desc>Example: <code>rgba(52, 72, 142, 255)</code></template>
</Property>

### rgbaString

<Property type="property" name="rgbaString">
  <template v-slot:type>
    <em>string</em>
  </template>
  <template v-slot:desc>Example: <code>52:72:142:255</code></template>
</Property>

### rgbaValue

<Property type="property" name="rgbaValue">
  <template v-slot:type>
    <em>Uint8ClampedArray</em> | <em>number[]</em>
  </template>
  <template v-slot:desc>Example: <code>[52, 72, 142, 255]</code></template>
</Property>

## Methods

### create

<Method type="method-static">
  <template v-slot:signature>
    create(<strong>data: </strong><em><Ref to="../interfaces/serialized-color">SerializedColor</Ref></em>):
    <em><Ref to="./color">Color</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="data"><em><Ref to="../interfaces/serialized-color">SerializedColor</Ref></em></Param>
  </template>
  <template v-slot:return><em><Ref to="./color">Color</Ref></em></template>
</Method>

### isEqual

<Method type="method">
  <template v-slot:signature>
    isEqual(<strong>color: </strong><em><Ref to="./color">Color</Ref></em>):
    <em>boolean</em>
  </template>
  <template v-slot:params>
    <Param name="color"><em><Ref to="./color">Color</Ref></em></Param>
  </template>
  <template v-slot:return><em>boolean</em></template>
  <template v-slot:example>
    Compares two colors by its individual rgba components.
  </template>
</Method>

### serialize

<Method type="method-implementation">
  <template v-slot:signature>
    serialize():
    <em><Ref to="../interfaces/serialized-color">SerializedColor</Ref></em>
  </template>
  <template v-slot:inherit>
    <Icon valign="bottom" type="implementation" /> of <Ref to="../interfaces/serializable">Serializable</Ref>.<Ref to="../interfaces/serializable#serialize">serialize</Ref>
  </template>
  <template v-slot:return><em><Ref to="../interfaces/serialized-color">SerializedColor</Ref></em></template>
</Method>

### Random

<Method type="method-static">
  <template v-slot:signature>
    Random():
    <em><Ref to="#class-color">Color</Ref></em>
  </template>
  <template v-slot:return><em><Ref to="#class-color">Color</Ref></em></template>
</Method>

### deSerialize

<Method type="method-static">
  <template v-slot:signature>
    deSerialize(<strong>data: </strong><em><Ref to="../interfaces/serialized-color">SerializedColor</Ref></em>):
    <em><Ref to="#class-color">Color</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="data"><em><Ref to="../interfaces/serialized-color">SerializedColor</Ref></em></Param>
  </template>
  <template v-slot:return><em><Ref to="#class-color">Color</Ref></em></template>
</Method>

### hexToRGBA

<Method type="method-static">
  <template v-slot:signature>
    hexToRGBA(<strong>hex: </strong><em>string</em>):
    <em>Uint8ClampedArray</em>
  </template>
  <template v-slot:params>
    <Param name="hex"><em>string</em></Param>
  </template>
  <template v-slot:return><em>Uint8ClampedArray</em></template>
</Method>

### rgbaToCSSString

<Method type="method-static">
  <template v-slot:signature>
    rgbaToCSSString(<strong>rgba: </strong><em>Uint8ClampedArray</em> | <em>number[]</em>):
    <em>string</em>
  </template>
  <template v-slot:params>
    <Param name="rgba"><em>Uint8ClampedArray</em> | <em>number[]</em></Param>
  </template>
  <template v-slot:return><em>string</em></template>
</Method>

### rgbaToHex

<Method type="method-static">
  <template v-slot:signature>
    rgbaToHex(<strong>rgba: </strong><em>Uint8ClampedArray</em> | <em>number[]</em>):
    <em>string</em>
  </template>
  <template v-slot:params>
    <Param name="rgba"><em>Uint8ClampedArray</em> | <em>number[]</em></Param>
  </template>
  <template v-slot:return><em>string</em></template>
</Method>

### rgbaToString

<Method type="method-static">
  <template v-slot:signature>
    rgbaToString(<strong>rgba: </strong><em>Uint8ClampedArray</em> | <em>number[]</em>):
    <em>string</em>
  </template>
  <template v-slot:params>
    <Param name="rgba"><em>Uint8ClampedArray</em> | <em>number[]</em></Param>
  </template>
  <template v-slot:return><em>string</em></template>
</Method>

### scale

<Method type="method-static">
  <template v-slot:signature>
    scale(<strong>colors: </strong><em>string[]</em> | <em>Uint8ClampedArray</em> | <em><Ref to="#class-color">Color</Ref>[]</em> | <em>number[][]</em>):
    <em>(t: number) => string</em>
  </template>
  <template v-slot:desc>
    Returns a linear interpolation function for given array of colors.
  </template>
  <template v-slot:params>
    <Param name="colors"><em>string[]</em> | <em>Uint8ClampedArray</em> | <em><Ref to="#class-color">Color</Ref>[]</em> | <em>number[][]</em></Param>
  </template>
  <template v-slot:return>
    <br/><strong><Function class="mr-0p5" /></strong><em>(t: number) => string</em>
  </template>
</Method>

<script setup>
import data from '../../../../../reflections/api/classes/color.json';
</script>
