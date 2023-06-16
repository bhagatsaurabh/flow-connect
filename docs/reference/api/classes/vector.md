# Class: Vector

A 2D vector.

## Hierarchy

<Hierarchy
  :implement="[
    {name: 'Serializable', link: '../interfaces/serializable.html'}
  ]"
/>

## Overview

<Overview :data="data" />

## Properties

### x

<Property type="property" name="x">
  <template v-slot:type>
    <em>number</em>
  </template>
</Property>

### y

<Property type="property" name="y">
  <template v-slot:type>
    <em>number</em>
  </template>
</Property>

## Methods

### abs

<Method type="method">
  <template v-slot:signature>
    abs():
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
  <template v-slot:desc>
    Performs Math.abs() on both the co-ordinates and returns a new Vector instance.
  </template>
</Method>

### absInPlace

<Method type="method">
  <template v-slot:signature>
    absInPlace():
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
  <template v-slot:desc>
    Performs Math.abs() on both the co-ordinates in-place.
  </template>
</Method>

### add

<Method type="method" multiple-sig="true">
  <template v-slot:signature>
    add(<strong>vector: </strong><em><Ref to="#class-vector">Vector</Ref></em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;add(<strong>scalar: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;add(<strong>x: </strong><em>number</em>, <strong>y: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### addInPlace

<Method type="method" multiple-sig="true">
  <template v-slot:signature>
    addInPlace(<strong>vector: </strong><em><Ref to="#class-vector">Vector</Ref></em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;addInPlace(<strong>scalar: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;addInPlace(<strong>x: </strong><em>number</em>, <strong>y: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### assign

<Method type="method" multiple-sig="true">
  <template v-slot:signature>
    assign(<strong>vector: </strong><em><Ref to="#class-vector">Vector</Ref></em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;assign(<strong>scalar: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;assign(<strong>x: </strong><em>number</em>, <strong>y: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### clamp

<Method type="method" multiple-sig="true">
  <template v-slot:signature>
    clamp(<strong>min: </strong><em>number</em>, <strong>max: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;clamp(<strong>minX: </strong><em>number</em>, <strong>maxX: </strong><em>number</em>,
    <strong>minY: </strong><em>number</em>, <strong>maxY: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### clampInPlace

<Method type="method" multiple-sig="true">
  <template v-slot:signature>
    clampInPlace(<strong>min: </strong><em>number</em>, <strong>max: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;clampInPlace(<strong>minX: </strong><em>number</em>, <strong>maxX: </strong><em>number</em>,
    <strong>minY: </strong><em>number</em>, <strong>maxY: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### clone

<Method type="method">
  <template v-slot:signature>
    clone():
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### create

<Method type="method-static">
  <template v-slot:signature>
    new Vector(<strong>xOrDOMPoint: </strong><em>number | <a href="https://developer.mozilla.org/en-US/docs/Web/API/DOMPoint">DOMPoint</a><ExternalLinkIcon /></em>,
    <strong>y?: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="xOrDOMPoint">
      <em>number | <a href="https://developer.mozilla.org/en-US/docs/Web/API/DOMPoint">DOMPoint</a><ExternalLinkIcon /></em>
    </Param>
    <Param name="y?">
      <em>number</em>
    </Param>
  </template>
</Method>

### isEqual

<Method type="method">
  <template v-slot:signature>
    isEqual(<strong>vector: </strong><em><Ref to="#class-vector">Vector</Ref></em>, <strong>threshold?: </strong><em>number</em>):
    <em>boolean</em>
  </template>
</Method>

### isInside

<Method type="method" multiple-sig="true">
  <template v-slot:signature>
    isInside(<strong>start: </strong><em><Ref to="#class-vector">Vector</Ref></em>,
    <strong>end: </strong><em><Ref to="#class-vector">Vector</Ref></em>):
    <em>boolean</em><br/>
    &nbsp;isInside(<strong>x1: </strong><em>number</em>, <strong>y1: </strong><em>number</em>,
    <strong>x2: </strong><em>number</em>, <strong>y2: </strong><em>number</em>):
    <em>boolean</em><br/>
  </template>
  <template v-slot:desc>
    If the vector is inside the specified rectangle.
  </template>
</Method>

### max

<Method type="method">
  <template v-slot:signature>
    max():
    <em>number</em>
  </template>
  <template v-slot:desc>
    Max of both the co-ordinates.
  </template>
</Method>

### multiply

<Method type="method" multiple-sig="true">
  <template v-slot:signature>
    multiply(<strong>vector: </strong><em><Ref to="#class-vector">Vector</Ref></em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;multiply(<strong>scalar: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;multiply(<strong>x: </strong><em>number</em>, <strong>y: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### multiplyInPlace

<Method type="method" multiple-sig="true">
  <template v-slot:signature>
    multiplyInPlace(<strong>vector: </strong><em><Ref to="#class-vector">Vector</Ref></em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;multiplyInPlace(<strong>scalar: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;multiplyInPlace(<strong>x: </strong><em>number</em>, <strong>y: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### normalize

<Method type="method" multiple-sig="true">
  <template v-slot:signature>
    normalize(<strong>min: </strong><em>number</em>, <strong>max: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;normalize(<strong>minX: </strong><em>number</em>, <strong>maxX: </strong><em>number</em>,
    <strong>minY: </strong><em>number</em>, <strong>maxY: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### normalizeInPlace

<Method type="method" multiple-sig="true">
  <template v-slot:signature>
    normalizeInPlace(<strong>min: </strong><em>number</em>, <strong>max: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;normalizeInPlace(<strong>minX: </strong><em>number</em>, <strong>maxX: </strong><em>number</em>,
    <strong>minY: </strong><em>number</em>, <strong>maxY: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### serialize

<Method type="method-implementation">
  <template v-slot:signature>
    serialize():
    <em><Ref to="../interfaces/serialized-vector">SerializedVector</Ref></em>
  </template>
  <template v-slot:inherit>
    <Icon valign="bottom" type="implementation" /> of <Ref to="../interfaces/serializable">Serializable</Ref>.<Ref to="../interfaces/serializable#serialize">serialize</Ref>
  </template>
  <template v-slot:return><em><Ref to="../interfaces/serialized-vector">SerializedVector</Ref></em></template>
</Method>

### subtract

<Method type="method" multiple-sig="true">
  <template v-slot:signature>
    subtract(<strong>vector: </strong><em><Ref to="#class-vector">Vector</Ref></em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;subtract(<strong>scalar: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;subtract(<strong>x: </strong><em>number</em>, <strong>y: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### subtractInPlace

<Method type="method" multiple-sig="true">
  <template v-slot:signature>
    subtractInPlace(<strong>vector: </strong><em><Ref to="#class-vector">Vector</Ref></em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;subtractInPlace(<strong>scalar: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em><br/>
    &nbsp;subtractInPlace(<strong>x: </strong><em>number</em>, <strong>y: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### toString

<Method type="method">
  <template v-slot:signature>
    toString():
    <em>string</em>
  </template>
</Method>

### transform

<Method type="method">
  <template v-slot:signature>
    transform(<strong>transform: </strong><em><a href="https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrix/DOMMatrix">DOMMatrix</a><ExternalLinkIcon /></em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### transformInPlace

<Method type="method">
  <template v-slot:signature>
    transformInPlace(<strong>transform: </strong><em><a href="https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrix/DOMMatrix">DOMMatrix</a><ExternalLinkIcon /></em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### Distance

<Method type="method-static" multiple-sig="true">
  <template v-slot:signature>
    Distance(<strong>vector1: </strong><em><Ref to="#class-vector">Vector</Ref></em>,
    <strong>vector2: </strong><em><Ref to="#class-vector">Vector</Ref></em>):
    <em>number</em><br/>
    &nbsp;Distance(<strong>x1: </strong><em>number</em>, <strong>y1: </strong><em>number</em>,
    <strong>x2: </strong><em>number</em>, <strong>y2: </strong><em>number</em>):
    <em>number</em>
  </template>
</Method>

### Midpoint

<Method type="method-static">
  <template v-slot:signature>
    Midpoint(<strong>vector1: </strong><em><Ref to="#class-vector">Vector</Ref></em>,
    <strong>vector2: </strong><em><Ref to="#class-vector">Vector</Ref></em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### Random

<Method type="method-static">
  <template v-slot:signature>
    Random(<strong>minX: </strong><em>number</em>, <strong>maxX: </strong><em>number</em>,
    <strong>minY: </strong><em>number</em>, <strong>maxY: </strong><em>number</em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### Zero

<Method type="method-static">
  <template v-slot:signature>
    Zero():
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
</Method>

### deSerialize

<Method type="method-static">
  <template v-slot:signature>
    deSerialize(<strong>data: </strong><em><Ref to="../interfaces/serialized-vector">SerializedVector</Ref></em>):
    <em><Ref to="#class-vector">Vector</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="data"><em><Ref to="../interfaces/serialized-vector">SerializedVector</Ref></em></Param>
  </template>
  <template v-slot:return><em><Ref to="#class-vector">Vector</Ref></em></template>
</Method>

<script setup>
import data from '../../../../../reflections/api/classes/vector.json';
</script>
