# Class: Flow

A Flow is a set of <Ref to="./node">Nodes</Ref>, <Ref to="./connector">Connectors</Ref> and <Ref to="./group">Groups</Ref>, it can also contain <Ref to="./sub-flow-node">SubFlowNodes</Ref>.

<img class="zoomable" alt="Example Flow" src="/images/example-flow.png" />

## Hierarchy

<Hierarchy
  :extend="{name: 'Hooks', link: './hooks'}"
  :implement="[{name: 'Serializable', link: '../interfaces/serializable.html'}]"
/>

## Overview

<Overview :data="data" />

## Constructor

::: tip
Also see <Ref to="./flow-connect#createflow">FlowConnect.createFlow</Ref>
:::

<Method type="constructor">
  <template v-slot:signature>
    new Flow(<strong>flowConnect: </strong><em><Ref to="./flow-connect">FlowConnect</Ref></em>,
    <strong>name: </strong><em>string</em>,
    <strong>rules: </strong><em><Ref to="../interfaces/rules">Rules</Ref></em>,
    <strong>terminalColors: </strong><em><Ref to="../interfaces/record">Record</Ref>&lt;string, string&gt;</em>):
    <em><Ref to="#class-flow">Flow</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flowConnect"><em><Ref to="./flow-connect">FlowConnect</Ref></em></Param>
    <Param name="name">
      <em>string</em>
    </Param>
    <Param name="rules">
      <em><Ref to="../interfaces/rules">Rules</Ref></em>
    </Param>
    <Param name="terminalColors">
      <em><Ref to="../interfaces/record">Record</Ref>&lt;string, string&gt;</em><br/>
      An object with keys as <Ref to="./terminal">Terminal</Ref> names and values as hex colors.
    </Param>
  </template>
</Method>

## Properties

### connectors

<Property type="property" name="connectors">
  <template v-slot:type>
    <em>Map&lt;string, <Ref to="./connector">Connector</Ref>&gt;</em>
  </template>
  <template v-slot:desc>
    Collection of all connectors a flow has.<br/>
    Keys are <Ref to="./connector#id">Connector.id</Ref>.
  </template>
</Property>

### executionGraph

<Property type="property" name="executionGraph">
  <template v-slot:type>
    <em><Ref to="./graph">Graph</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the graph that executes nodes in order.
  </template>
</Property>

### flowConnect

<Property type="property" name="flowConnect">
  <template v-slot:type>
    <em><Ref to="./flow-connect">FlowConnect</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the FlowConnect instance from which this flow was created.
  </template>
</Property>

### globalEvents

<Property type="property" name="globalEvents">
  <template v-slot:type>
    <em><Ref to="./hooks">Hooks</Ref></em>
  </template>
  <template v-slot:desc>
    A general purpose global event bus.
  </template>
</Property>

### groups

<Property type="property" name="groups">
  <template v-slot:type>
    <em>Map&lt;string, <Ref to="./group">Group</Ref>&gt;</em>
  </template>
  <template v-slot:desc>
    Collection of all the groups in this flow.<br/>
    Keys are <Ref to="./group#id">Group.id</Ref>.
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

### inputs

<Property type="property" name="inputs">
  <template v-slot:type>
    <em><Ref to="./tunnel-node">TunnelNode</Ref>[]</em>
  </template>
  <template v-slot:desc>
    Collection of all the inputs for this flow.<br/><br/>
    A flow can recieve inputs from another flow via these special nodes acting as proxies between two different flows.
  </template>
</Property>

### name

<Property type="property" name="name">
  <template v-slot:type>
    <em>string</em>
  </template>
</Property>

### nodes

<Property type="property" name="inputs">
  <template v-slot:type>
    <em>Map&lt;string, <Ref to="./node">Node</Ref>&gt;</em>
  </template>
  <template v-slot:desc>
    Collection of all the nodes of this flow (except <Ref to="#inputs">inputs</Ref> and <Ref to="#output">outputs</Ref>).<br/>
    Keys are <Ref to="./node#id">Node.id</Ref>.
  </template>
</Property>

### outputs

<Property type="property" name="outputs">
  <template v-slot:type>
    <em><Ref to="./tunnel-node">TunnelNode</Ref>[]</em>
  </template>
  <template v-slot:desc>
    Collection of all the outputs for this flow.<br/><br/>
    A flow can provide outputs to another flow via these special nodes acting as proxies between two different flows.
  </template>
</Property>

### parentFlow

<Property type="property" name="parentFlow">
  <template v-slot:type>
    <em><Ref to="#class-flow">Flow</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the parent flow (if this is a sub-flow)
  </template>
</Property>

### renderResolver

<Property type="property" :extras="['readonly']" name="renderResolver">
  <template v-slot:type>
    {<br/>
      <span class="ml-1">
        <Optional class="mr-0p5" /><strong>connector: </strong>
        <Ref to="../interfaces/render-resolver">RenderResolver</Ref
        >&lt;<Ref to="./connector">Connector</Ref>,
        <Ref to="../interfaces/connector-renderparams">ConnectorRenderParams</Ref>&gt;
      </span><br/>
      <span class="ml-1">
        <Optional class="mr-0p5" /><strong>group?: </strong>
        <Ref to="../interfaces/render-resolver">RenderResolver</Ref
        >&lt;<Ref to="./group">Group</Ref>,
        <Ref to="../interfaces/group-renderparams">GroupRenderParams</Ref>&gt;
      </span><br/>
      <span class="ml-1">
        <Optional class="mr-0p5" /><strong>node?: </strong>
        <Ref to="../interfaces/render-resolver">RenderResolver</Ref
        >&lt;<Ref to="./node">Node</Ref>,
        <Ref to="../interfaces/node-renderparams">NodeRenderParams</Ref>&gt;
      </span><br/>
      <span class="ml-1">
        <Optional class="mr-0p5" /><strong>nodeButton?: </strong>
        <Ref to="../interfaces/render-resolver">RenderResolver</Ref
        >&lt;<Ref to="./node-button">NodeButton</Ref>,
        <Ref to="../interfaces/nodebutton-renderparams">NodeButtonRenderParams</Ref>&gt;
      </span><br/>
      <span class="ml-1">
        <Optional class="mr-0p5" /><strong>terminal?: </strong>
        <Ref to="../interfaces/render-resolver">RenderResolver</Ref
        >&lt;<Ref to="./terminal">Terminal</Ref>,
        <Ref to="../interfaces/terminal-renderparams">TerminalRenderParams</Ref>&gt;
      </span><br/>
      <span class="ml-1">
        <Optional class="mr-0p5" /><strong>uiContainer?: </strong>
        <Ref to="../interfaces/render-resolver">RenderResolver</Ref
        >&lt;<Ref to="../nodeui/container">Container</Ref>,
        <Ref to="../interfaces/container-renderparams">ContainerRenderParams</Ref>&gt;
      </span>
    <br/>}
  </template>
  <template v-slot:desc>
  A <Ref to="../interfaces/render-resolver">RenderResolver</Ref> which is scoped to the Flow instance.

  Any custom render functions specified using this resolver will affect everything inside this <Ref to="./flow">Flow</Ref> instance.
  </template>
  <template v-slot:default>{}</template>
</Property>

### rules

<Property type="property" name="rules">
  <template v-slot:type>
    <em><Ref to="../interfaces/rules">Rules</Ref></em>
  </template>
  <template v-slot:desc>
    Specifies what terminal types can be connected to one another.<br/><br/>
    Also see, <Ref to="./flow-connect#createflow">FlowConnect.createFlow</Ref>.
  </template>
</Property>


## Accessors

### state

<Property type="accessor" :extras="['readonly']" name="flow">
  <template v-slot:type>
    <em><Ref to="../enums/flow-state">FlowState</Ref></em>
  </template>
  <template v-slot:desc>
    The current state of the flow.
  </template>
</Property>

## Methods

### addInput

<Method type="method">
  <template v-slot:signature>
    addInput(<strong>name: </strong><em>string</em>,
    <strong>dataType: </strong><em>string</em>,
    <strong>position</strong><em>: <Ref to="./vector">Vector</Ref></em>):
    <em><Ref to="./tunnel-node">TunnelNode</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="name"><em>string</em></Param>
    <Param name="dataType"><em>string</em></Param>
    <Param name="position"><em><Ref to="./vector">Vector</Ref></em></Param>
  </template>
  <template v-slot:desc>
    Adds a new input to flow.
  </template>
   <template v-slot:return>
    <em><Ref to="./tunnel-node">TunnelNode</Ref></em>
  </template>
  <template v-slot:example>
    <img class="zoomable" alt="add-input-example" src="/images/add-input-example.png" />
  </template>
</Method>

### addOutput

<Method type="method">
  <template v-slot:signature>
    addOutput(<strong>name: </strong><em>string</em>,
    <strong>dataType: </strong><em>string</em>,
    <strong>position</strong><em>: <Ref to="./vector">Vector</Ref></em>):
    <em><Ref to="./tunnel-node">TunnelNode</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="name"><em>string</em></Param>
    <Param name="dataType"><em>string</em></Param>
    <Param name="position"><em><Ref to="./vector">Vector</Ref></em></Param>
  </template>
  <template v-slot:desc>
    Adds a new output to flow.
  </template>
   <template v-slot:return>
    <em><Ref to="./tunnel-node">TunnelNode</Ref></em>
  </template>
  <template v-slot:example>
    <img class="zoomable" alt="add-output-example" src="/images/add-output-example.png" />
  </template>
</Method>

### addSubFlow

<Method type="method">
  <template v-slot:signature>
    addSubFlow(<strong>flow: </strong><em><Ref to="#class-flow">Flow</Ref></em>,
    <strong>position</strong><em>: <Ref to="./vector">Vector</Ref></em>):
    <em><Ref to="./subflow-node">SubFlowNode</Ref></em>
  </template> 
  <template v-slot:params>
    <Param name="flow"><em><Ref to="#class-flow">Flow</Ref></em></Param>
    <Param name="position"><em><Ref to="./vector">Vector</Ref></em></Param>
  </template>
  <template v-slot:desc>
    Adds another flow as a sub-flow.
  </template>
   <template v-slot:return>
    <em><Ref to="./subflow-node">SubFlowNode</Ref></em>
  </template>
  <template v-slot:example>
    <img class="zoomable" alt="add-sub-flow-example" src="/images/add-sub-flow-example.png" />
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

### createNode

<Method type="method">
  <template v-slot:signature>
    createNode(<strong>name: </strong><em>string</em>,
    <strong>position: </strong><em><Ref to="./vector">Vector</Ref></em>,
    <strong>width: </strong><em>number</em>,
    <strong>options?: </strong><em><Ref to="../interfaces/node-options">NodeOptions</Ref></em>):
    <em><Ref to="./node">Node</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="name"><em>string</em></Param>
    <Param name="position"><em><Ref to="./vector">Vector</Ref></em></Param>
    <Param name="width"><em>number</em></Param>
    <Param name="options?"><em><Ref to="../interfaces/node-options">NodeOptions</Ref></em></Param>
  </template>
  <template v-slot:desc>
    Creates and adds a new <Ref to="./node">Node</Ref> to the flow.
  </template>
   <template v-slot:return>
    <em><Ref to="./node">Node</Ref></em>
  </template>
  <template v-slot:example>

  ```js
  let node = flow.createNode(
    'Test Node',
    new Vector(50, 50),
    250,
    {
      inputs: [
        { name: 'A', dataType: 'a' },
        { name: 'B', dataType: 'b' }
      ],
      outputs: [
        { name: 'C', dataType: 'c' }
      ],
      state: {
        labelText: 'Label Text',
        sliderValue: 50,
        toggle: false
      },
      style: {
        padding: 10,
        spacing: 10
      },
      terminalStyle: {}
    }
  );
  ```

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

### removeNode

::: danger BETA
In active development, might not work or can be unstable leading to unexpected results
:::

<Method type="method">
  <template v-slot:signature>
    removeNode(<strong>nodeOrId: </strong><em>string | <Ref to="./node">Node</Ref></em>):
    <em>void</em>
  </template>
  <template v-slot:params>
    <Param name="nodeOrId">
      <em>string | <Ref to="./node">Node</Ref></em><br/>
      Reference to a node or its <Ref to="./node#id">Node.id</Ref>.
    </Param>
  </template>
  <template v-slot:desc>
    Removes a node from the flow.
  </template>
</Method>

### serialize

<Method type="method-implementation">
  <template v-slot:signature>
    serialize():
    <em><Ref to="../interfaces/serialized-connector">SerializedConnector</Ref></em>
  </template>
  <template v-slot:inherit>
    <Icon valign="bottom" type="implementation" /> of <Ref to="../interfaces/serializable">Serializable</Ref>.<Ref to="../interfaces/serializable#serialize">serialize</Ref>
  </template>
  <template v-slot:return><em><Ref to="../interfaces/serialized-connector">SerializedConnector</Ref></em></template>
</Method>

### start

<Method type="method">
  <template v-slot:signature>
    start():
    <em>void</em>
  </template>
  <template v-slot:desc>
    Starts execution of flow.
  </template>
</Method>

### stop

<Method type="method">
  <template v-slot:signature>
    stop():
    <em>void</em>
  </template>
  <template v-slot:desc>
    Stops execution of flow.
  </template>
</Method>

### deSerialize

<Method type="method-static">
  <template v-slot:signature>
    deSerialize(<strong>flowConnect: </strong><em><Ref to="./flow-connect">FlowConnect</Ref></em>,
    <strong>data: </strong><em><Ref to="../interfaces/serialized-flow">SerializedFlow</Ref></em>):
    <em><Ref to="#class-flow">Flow</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flowConnect"><em><Ref to="./flow-connect">FlowConnect</Ref></em></Param>
    <Param name="data"><em><Ref to="../interfaces/serialized-flow">SerializedFlow</Ref></em></Param>
  </template>
  <template v-slot:return><em><Ref to="#class-flow">Flow</Ref></em></template>
</Method>

## Events

### add-input <Icon type="event" /> {#event-add-input}

<Event type="event">
  <template v-slot:desc>
    When a new input gets added to the flow using <Ref to="#addinput">addInput</Ref>.
  </template>
</Event>

### add-output <Icon type="event" /> {#event-add-output}

<Event type="event">
  <template v-slot:desc>
    When a new output gets added to the flow using <Ref to="#addoutput">addOutput</Ref>.
  </template>
</Event>

### render <Icon type="event" /> {#event-render}

<Event type="event">
  <template v-slot:desc>
    When a single render cycle completes for this flow.
  </template>
</Event>

### start <Icon type="event" /> {#event-start}

<Event type="event">
  <template v-slot:desc>
    When the flow starts executing.
  </template>
</Event>

### stop <Icon type="event" /> {#event-stop}

<Event type="event">
  <template v-slot:desc>
    When the flow stops executing.
  </template>
</Event>

<script setup>
import data from '../../../../../reflections/api/classes/flow.json';
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
