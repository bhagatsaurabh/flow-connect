# Class: NodeButton

A NodeButton is a configurable button that is rendered besides <Ref to="./node">node</Ref> <Ref to="./node#name">name</Ref>.

<img class="zoomable" alt="Node-button example" src="/images/node-button-example.png" />

Example:
```js
  node.addNodeButton(
    () => doSomething(),
    (
      context: CanvasRenderingContext2D,
      params: NodeButtonRenderParams,
      nodeButton: NodeButton
    ) => {
      let style = nodeButton.node.style;

      context.strokeStyle = style.color;
      context.beginPath();
      context.arc(params.position.x, params.position.y, 10, 0, 2 * Math.PI);
      context.closePath();

      context.stroke();
    },
    Align.Right
  );
```

## Hierarchy

<Hierarchy
  :extend="{name: 'Hooks', link: './hooks'}"
  :implement="[
    {name: 'Renderable', link: '../interfaces/renderable.html'}
  ]"
/>

## Overview

<Overview :data="data" />

## Constructor

::: tip
If a new NodeButton needs to be added to the Node, but you don't want to use this constructor, see <Ref to="./node#addnodebutton">Node.addNodeButton</Ref>.
:::

<Method type="constructor">
  <template v-slot:signature>
    new NodeButton(<strong>node: </strong><em><Ref to="./node">Node</Ref></em>,
    <strong>callback: </strong><em>() => void</em>,
    <strong>render: </strong><em><Ref to="../interfaces/render-function">RenderFunction</Ref>&lt;<Ref to="#class-nodebutton">NodeButton</Ref>, <Ref to="../interfaces/node-button-render-params">NodeButtonRenderParams</Ref>&gt;</em>,
    <strong>align: </strong><em><Ref to="../enums/align">Align</Ref></em>,
    <strong>style?: </strong><em><Ref to="../interfaces/record">Record</Ref>&lt;string, any&gt;</em>):
    <em><Ref to="#class-nodebutton">NodeButton</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="node"><em><Ref to="./node">Node</Ref></em></Param>
    <Param name="callback">
      <em>() => void</em>
    </Param>
    <Param name="render">
      <em><Ref to="../interfaces/render-function">RenderFunction</Ref>&lt;<Ref to="#class-nodebutton">NodeButton</Ref>, <Ref to="../interfaces/node-button-render-params">NodeButtonRenderParams</Ref>&gt;</em>
    </Param>
    <Param name="align">
      <em><Ref to="../enums/align">Align</Ref></em>
    </Param>
    <Param name="style?">
      <em><Ref to="../interfaces/record">Record</Ref>&lt;string, any&gt;</em>
    </Param>
  </template>
</Method>

## Properties

### align

<Property type="property" name="align">
  <template v-slot:type>
    <em><Ref to="../enums/align">Align</Ref></em>
  </template>
  <template v-slot:desc>
    Align button to the left or right of node's name.
  </template>
</Property>

### callback

<Property type="property" name="callback">
  <template v-slot:type>
    <em><Function class="mr-0p5" />() => void</em>
  </template>
  <template v-slot:desc>
    Function that will be called when click event happens.
  </template>
</Property>

### node

<Property type="property" name="node">
  <template v-slot:type>
    <em><Ref to="./node">Node</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the <Ref to="./node">Node</Ref> of this button.
  </template>
</Property>

### renderer

<Property type="property" name="renderer">
  <template v-slot:type>
    <em><Ref to="../interfaces/render-fn">RenderFn</Ref>&lt;<Ref to="class-nodebutton">NodeButton</Ref>, <Ref to="../interfaces/node-button-render-params">NodeButtonRenderParams</Ref>&gt;</em>
  </template>
  <template v-slot:desc>
  A <Ref to="../interfaces/render-fn">RenderFn</Ref> which is scoped to the Node-button instance.

  Any custom render function specified using this resolver will only affect this NodeButton instance.
  </template>
  <template v-slot:default>() => null</template>
</Property>

### style

<Property type="property" name="style">
  <template v-slot:type>
    <em><Ref to="../interfaces/record">Record</Ref>&lt;string, any&gt;</em>
  </template>
  <template v-slot:default>{}</template>
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

## Events

### render <Icon type="event" /> {#event-render}

<Event type="event">
  <template v-slot:desc>
    When a single render cycle completes for this node-button instance.
  </template>
</Event>

<script setup>
import data from '../../../../../reflections/api/classes/node-button.json';
</script>
