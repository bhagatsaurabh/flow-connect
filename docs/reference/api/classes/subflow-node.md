# Class: SubFlowNode

A SubFlowNode is a special type of <Ref to="./node">Node</Ref> that holds reference to another <Ref to="./flow">Flow</Ref> (a nested flow) and proxies input/output data through its <Ref to="./terminal">terminals</Ref> to the inner flow's <Ref to="./tunnel-node">TunnelNodes</Ref>.

<img class="zoomable" alt="/Sub-flow node example" src="/images/sub-flow-node-example.png" />

## Hierarchy

<Hierarchy
  :extend="{name: 'Node', link: './node'}"
/>

## Overview

All Properties, Accessors, Methods and Events <Icon type="inherited" class="ml-0p5" /> from <Ref to="./node">Node</Ref>.

<Overview :data="data" />

## Constructor

::: tip
Also see <Ref to="./flow#addsubflow">Flow.addSubFlow</Ref>.
:::

<Method type="constructor">
  <template v-slot:signature>
    new SubFlowNode(<strong>flow: </strong><em><Ref to="./flow">Flow</Ref></em>,
    <strong>subFlow: </strong><em><Ref to="./flow">Flow</Ref></em>,
    <strong>position: </strong><em><Ref to="./vector">Vector</Ref></em>,
    <strong>width: </strong><em>number</em>,
    <strong>inputs: </strong><em>any[]</em>,
    <strong>outputs: </strong><em>any[]</em>,
    <strong>options?: </strong><em><Ref to="../interfaces/sub-flow-options">SubFlowOptions</Ref></em>):
    <em><Ref to="#class-subflownode">SubFlowNode</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flow"><em><Ref to="./flow">Flow</Ref></em></Param>
    <Param name="subFlow">
      <em><Ref to="./flow">Flow</Ref></em>
    </Param>
    <Param name="position">
      <em><Ref to="./vector">Vector</Ref></em>
    </Param>
    <Param name="width">
      <em>number</em>
    </Param>
    <Param name="inputs">
      <em>any[]</em><br/>
      Array of <Ref to="../interfaces/serialized-terminal">SerializedTerminals</Ref> specifying the inputs of new SubFlowNode and also the input <Ref to="./tunnel-node">TunnelNodes</Ref> of the <Ref to="#subflow">subFlow</Ref>.
    </Param>
    <Param name="outputs">
      <em>any[]</em><br/>
      Array of <Ref to="../interfaces/serialized-terminal">SerializedTerminals</Ref> specifying the outputs of new SubFlowNode and also the output <Ref to="./tunnel-node">TunnelNodes</Ref> of the <Ref to="#subflow">subFlow</Ref>.
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/sub-flow-options">SubFlowOptions</Ref></em>
  <template v-slot:default-value>

  ```js
  {
    style: {},
    terminalStyle: {},
    state: {}
  }
  ```
  </template>
    </Param>
  </template>
</Method>

## Properties

### subFlow

<Property type="property" name="subFlow">
  <template v-slot:type>
    <em><Ref to="./flow">Flow</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the inner sub-flow.
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
    <em><Ref to="../interfaces/serialized-node">SerializedNode</Ref></em>
  </template>
  <template v-slot:inherit>
    <Icon valign="bottom" type="implementation" /> of <Ref to="../interfaces/serializable">Serializable</Ref>.<Ref to="../interfaces/serializable#serialize">serialize</Ref>
  </template>
  <template v-slot:return><em><Ref to="../interfaces/serialized-node">SerializedNode</Ref></em></template>
</Method>

### deSerialize

<Method type="method-static">
  <template v-slot:signature>
    deSerialize(<strong>flow: </strong><em><Ref to="./flow">Flow</Ref></em>,
    <strong>data: </strong><em><Ref to="../interfaces/serialized-node">SerializedNode</Ref></em>):
    <em><Ref to="#class-subflownode">SubFlowNode</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flow"><em><Ref to="./flow">Flow</Ref></em></Param>
    <Param name="data"><em><Ref to="../interfaces/serialized-node">SerializedNode</Ref></em></Param>
  </template>
  <template v-slot:return><em><Ref to="#class-subflownode">SubFlowNode</Ref></em></template>
</Method>

<script setup>
import data from '../../../../../reflections/api/classes/subflow-node.json';
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
