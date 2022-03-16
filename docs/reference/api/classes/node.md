# Class: Node

A Node is a singular processing unit in a <Ref to="./flow">Flow</Ref> accepting inputs through input <Ref to="./terminal">terminals</Ref> and producing output through output terminals for other connected nodes/flows.

<img class="zoomable" alt="Node example" src="/images/node-example.png" />

A node can also have interactive UI inside it, using <Ref to="./ui-node">UINodes</Ref> for showing labels, selectors, toggles, files, sliders, buttons, dials, images, and a lot more.

## Hierarchy

<Hierarchy
  :extend="{name: 'Hooks', link: './hooks'}"
  :implement="[
    {name: 'Events', link: '../interfaces/events.html'},
    {name: 'Serializable', link: '../interfaces/serializable.html'},
    {name: 'Renderable', link: '../interfaces/renderable.html'}
  ]"
/>

## Overview

<Overview :data="data" />

## Constructor

<Method type="constructor">
  <template v-slot:signature>
    new Node(<strong>flow: </strong><em><Ref to="./flow">Flow</Ref></em>,
    <strong>name: </strong><em>string</em>,
    <strong>position: </strong><em><Ref to="./vector">Vector</Ref></em>,
    <strong>width: </strong><em>number</em>,
    <strong>inputs: </strong><em><Ref to="../interfaces/serialized-terminal">SerializedTerminal</Ref>[]</em>,
    <strong>outputs: </strong><em><Ref to="../interfaces/serialized-terminal">SerializedTerminal</Ref>[]</em>,
    <strong>options?: </strong><em><Ref to="../interfaces/node-constructor-options">NodeConstructorOptions</Ref></em>):
    <em><Ref to="#class-node">Node</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flow"><em><Ref to="./flow">Flow</Ref></em></Param>
    <Param name="name">
      <em>string</em>
    </Param>
    <Param name="position">
      <em><Ref to="./vector">Vector</Ref></em>
    </Param>
    <Param name="width">
      <em>number</em>
    </Param>
    <Param name="inputs">
      <em><Ref to="../interfaces/serialized-terminal">SerializedTerminal</Ref>[]</em>
    </Param>
    <Param name="outputs">
      <em><Ref to="../interfaces/serialized-terminal">SerializedTerminal</Ref>[]</em>
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/connector-options">ConnectorOptions</Ref></em>
      <template v-slot:default-value>
        <Ref to="../functions/default-node-constructor-options">DefaultNodeConstructorOptions</Ref>
      </template>
    </Param>
  </template>
</Method>

## Properties

### flow

<Property type="property" name="flow">
  <template v-slot:type>
    <em><Ref to="./flow">Flow</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the <Ref to="./flow">Flow</Ref> in which this node exists.
  </template>
</Property>

### focused

<Property type="property" name="focused">
  <template v-slot:type>
    <em>boolean</em>
  </template>
  <template v-slot:desc>
    Node's current focused state.
    <img class="zoomable" alt="Focused node" src="/images/focused-node-example.png" />
  </template>
</Property>

### group

<Property type="property" name="group">
  <template v-slot:type>
    <em><Ref to="./group">Group</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the <Ref to="./group">Group</Ref> if this node is grouped with other nodes.
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
    <em><Ref to="./terminal">Terminal</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to all the input terminals of the node.
  </template>
</Property>

### inputsUI

<Property type="property" name="inputsUI">
  <template v-slot:type>
    <em><Ref to="./terminal">Terminal</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to all the input terminals of node that are bound to one of the <Ref to="./ui-node">UINodes</Ref>.<br/>
    For e.g. A Label can have it's own input/output terminal.
    <img class="zoomable" alt="Label inside node with input and output terminals" src="/images/label-terminals.png" />
  </template>
</Property>

### name

<Property type="property" name="name">
  <template v-slot:type>
    <em>string</em>
  </template>
  <template v-slot:desc>
    Display name of the node.
  </template>
</Property>

### nodeButtons

<Property type="property" name="nodeButtons">
  <template v-slot:type>
    <em>Map&lt;string, <Ref to="./node-button">NodeButton</Ref>&gt;</em>
  </template>
  <template v-slot:desc>
    Collection of all the <Ref to="./node-button">node-buttons</Ref> displayed besides the node's <Ref to="#name">name</Ref>.<br/>
    <img class="zoomable" alt="Node-button example" src="/images/node-button-example.png" />
  </template>
</Property>

### outputs

<Property type="property" name="outputs">
  <template v-slot:type>
    <em><Ref to="./terminal">Terminal</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to all the output terminals of the node.
  </template>
</Property>

### outputsUI

<Property type="property" name="outputsUI">
  <template v-slot:type>
    <em><Ref to="./terminal">Terminal</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to all the output terminals of node that are bound to one of the <Ref to="./ui-node">UINodes</Ref>.<br/>
    For e.g. A Label can have it's own input/output terminal.
    <img class="zoomable" alt="Label inside node with input and output terminals" src="/images/label-terminals.png" />
  </template>
</Property>

### renderResolver

<Property type="property" name="renderResolver">
  <template v-slot:type>
    {<br/>
      <span class="ml-1">
        <Optional class="mr-0p5" /><strong>node?: </strong>
        <Ref to="../interfaces/render-resolver">RenderResolver</Ref
        >&lt;<Ref to="#class-node">Node</Ref>,
        <Ref to="../interfaces/node-renderparams">NodeRenderParams</Ref>&gt;
      </span><br/>
      <span class="ml-1">
        <Optional class="mr-0p5" /><strong>nodeButton?: </strong>
        <Ref to="../interfaces/render-resolver">RenderResolver</Ref
        >&lt;<Ref to="./node-button">NodeButton</Ref>,
        <Ref to="../interfaces/node-button-renderparams">NodeButtonRenderParams</Ref>&gt;
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
        >&lt;<Ref to="./container">Container</Ref>,
        <Ref to="../interfaces/container-renderparams">ContainerRenderParams</Ref>&gt;
      </span>
    <br/>}
  </template>
  <template v-slot:desc>
  A <Ref to="../interfaces/render-resolver">RenderResolver</Ref> which is scoped to the Node instance.

  Any custom render functions specified using this resolver will only affect everything inside this node instance.
  </template>
  <template v-slot:default>{}</template>
</Property>

### renderState

<Property type="property" name="renderState">
  <template v-slot:type>
    <Ref to="../interfaces/render-state">RenderState</Ref>
  </template>
  <template v-slot:desc>
    The RenderState of a node is a collection of various states corresponding to Viewport visibility, maximized/minimized state and level-of-detail to show when zooming in/out. 
  </template>
  <template v-slot:default>
    <pre>
{
  viewport: <Ref to="../enums/viewport">Viewport</Ref>.INSIDE,
  nodeState: <Ref to="../enums/node-state">NodeState</Ref>.MAXIMIZED,
  lod: <Ref to="../enums/lod">LOD</Ref>.LOD2
}</pre>
  </template>
</Property>

### state

<Property type="property" name="state">
  <template v-slot:type>
    <em><Ref to="../interfaces/record">Record</Ref>&lt;string, any&gt;</em>
  </template>
  <template v-slot:desc>
    A local reactive state of the node, properties defined within this state is two-way bindable with any <Ref to="./ui-node">UINode</Ref>.

  ```js
  let customNode = flow.createNode(
    "Custom Node",
    new Vector(50, 50), 170,
    {
      state: {
        name: "John Doe",
        age: 24
      }
    }
  );
  ```
  </template>
</Property>

### style

<Property type="property" name="style">
  <template v-slot:type>
    <em><Ref to="../interfaces/node-style">NodeStyle</Ref></em>
  </template>
  <template v-slot:default>
    <Ref to="../interfaces/default-connector-style">DefaultNodeStyle</Ref>
  </template>
</Property>

### terminalStyle

<Property type="property" name="terminalStyle">
  <template v-slot:type>
    <em><Ref to="../interfaces/terminal-style">TerminalStyle</Ref></em>
  </template>
</Property>

### terminals

<Property type="property" name="terminals">
  <template v-slot:type>
    <em>Map&lt;string, <Ref to="./terminal">Terminal</Ref>&gt;</em>
  </template>
  <template v-slot:desc>
    Reference to all the terminals (inputs/outputs) of the node mapped to their id's.
  </template>
</Property>

### ui

<Property type="property" name="ui">
  <template v-slot:type>
    <em><Ref to="./container">Container</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the UI Container which is also the root <Ref to="./ui-node">UINode</Ref>.
  </template>
</Property>

### uiNodes

<Property type="property" name="uiNodes">
  <template v-slot:type>
    <em>Map&lt;string, <Ref to="./ui-node">UINode</Ref>&gt;</em>
  </template>
  <template v-slot:desc>
    Reference to all the UINodes.
  </template>
</Property>

## Accessors

### height

<Property type="accessor" name="height">
  <template v-slot:type>
    <em>number</em>
  </template>
</Property>

### position

<Property type="accessor" name="position">
  <template v-slot:type>
    <em><Ref to="./vector">Vector</Ref></em>
  </template>
</Property>

### width

<Property type="accessor" name="width">
  <template v-slot:type>
    <em>number</em>
  </template>
</Property>

### zIndex

<Property type="accessor" name="zIndex">
  <template v-slot:type>
    <em>number</em>
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
    <em><Ref to="../interfaces/serialized-connector">SerializedConnector</Ref></em>
  </template>
  <template v-slot:inherit>
    <Icon valign="bottom" type="implementation" /> of <Ref to="../interfaces/serializable">Serializable</Ref>.<Ref to="../interfaces/serializable#serialize">serialize</Ref>
  </template>
  <template v-slot:return><em><Ref to="../interfaces/serialized-connector">SerializedConnector</Ref></em></template>
</Method>

### deSerialize

<Method type="method-static">
  <template v-slot:signature>
    deSerialize(<strong>flow: </strong><em><Ref to="./flow">Flow</Ref></em>,
    <strong>start: </strong><em><Ref to="./terminal">Terminal</Ref></em>,
    <strong>end: </strong><em><Ref to="./terminal">Terminal</Ref></em>,
    <strong>data: </strong><em><Ref to="../interfaces/serialized-connector">SerializedConnector</Ref></em>):
    <em><Ref to="#class-connector">Connector</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flow"><em><Ref to="./flow">Flow</Ref></em></Param>
    <Param name="start"><em><Ref to="./terminal">Terminal</Ref></em></Param>
    <Param name="end"><em><Ref to="./terminal">Terminal</Ref></em></Param>
    <Param name="data"><em><Ref to="../interfaces/serialized-connector">SerializedConnector</Ref></em></Param>
  </template>
  <template v-slot:return><em><Ref to="#class-connector">Connector</Ref></em></template>
</Method>

## Events

### process <Icon type="event" /> {#event-process}

<Event type="event">
  <template v-slot:desc>
    When the node is triggered for processing due to new/changed input.
  </template>
</Event>

### render <Icon type="event" /> {#event-render}

<Event type="event">
  <template v-slot:desc>
    When a single render cycle completes for this node instance.
  </template>
</Event>

### down <Icon type="event" /> {#event-down}

<Event type="event">
  <template v-slot:desc>
    When touch down or mouse left down occurs on the node.
  </template>
</Event>

### over <Icon type="event" /> {#event-over}

<Event type="event">
  <template v-slot:desc>
    When mouse over happens on the node.
  </template>
</Event>

### enter <Icon type="event" /> {#event-enter}

<Event type="event">
  <template v-slot:desc>
    When mouse enter happens on the node.
  </template>
</Event>

### exit <Icon type="event" /> {#event-exit}

<Event type="event">
  <template v-slot:desc>
    When mouse exit happens on the node
  </template>
</Event>

### up <Icon type="event" /> {#event-up}

<Event type="event">
  <template v-slot:desc>
    When touch up or mouse left up happens on the node.
  </template>
</Event>

### click <Icon type="event" /> {#event-click}

<Event type="event">
  <template v-slot:desc>
    When tap or mouse click happens on the node.
  </template>
</Event>

### drag <Icon type="event" /> {#event-drag}

<Event type="event">
  <template v-slot:desc>
    When touch or mouse drag happens on the node.
  </template>
</Event>

### rightclick <Icon type="event" /> {#event-rightclick}

<Event type="event">
  <template v-slot:desc>
    When mouse right-click happens on the node.
  </template>
</Event>

### wheel <Icon type="event" /> {#event-wheel}

<Event type="event">
  <template v-slot:desc>
    When mouse scroll happens on the node.
  </template>
</Event>

<script setup>
import data from '../../../../../reflections/api/classes/node.json';
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
