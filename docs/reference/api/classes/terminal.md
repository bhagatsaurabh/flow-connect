# Class: Terminal

A Terminal is an input/output interface for a <Ref to="./node">node</Ref>, it can get/set data from/to the <Ref to="./connector">connector</Ref>.

<img class="zoomable" alt="Node terminals example" src="/images/terminals-example.png" />

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

::: tip
Also see, <Ref to="./node#addterminal">Node.addTerminal</Ref>.
:::

<Method type="constructor">
  <template v-slot:signature>
    new Terminal(<strong>node: </strong><em><Ref to="./node">Node</Ref></em>,
    <strong>type: </strong><em><Ref to="../enums/terminal-type">TerminalType</Ref></em>,
    <strong>dataType: </strong><em>string</em>,
    <strong>name: </strong><em>string</em>,
    <strong>options?: </strong><em><Ref to="../interfaces/terminal-options">TerminalOptions</Ref></em>):
    <em><Ref to="#class-terminal">Terminal</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="node"><em><Ref to="./node">Node</Ref></em></Param>
    <Param name="type">
      <em><Ref to="../enums/terminal-type">TerminalType</Ref></em>
    </Param>
    <Param name="dataType">
      <em>string</em>
    </Param>
    <Param name="name">
      <em>string</em>
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/terminal-options">TerminalOptions</Ref></em>
  <template v-slot:default-value>

  ```js
  {
    style: {}
  }
  ```
  </template>
    </Param>
  </template>
</Method>

## Properties

### connectors

<Property type="property" name="connectors">
  <template v-slot:type>
    <em><Ref to="./connector">Connector</Ref>[]</em>
  </template>
  <template v-slot:desc>
    Reference to all the connectors this terminal is connected to.<br/><br/>
    For an input terminal this array will always contain a single connector reference, since an input terminal can only take data from a single input source.
  </template>
</Property>

### dataType

<Property type="property" name="dataType">
  <template v-slot:type>
    <em>string</em>
  </template>
  <template v-slot:desc>
    One of the data-types defined in <Ref to="./flow#rules">rules</Ref> while creating a <Ref to="./flow">Flow</Ref> using method <Ref to="./flow-connect#createflow">FlowConnect.createFlow</Ref>.
  </template>
</Property>

### focus

<Property type="property" name="focus">
  <template v-slot:type>
    <em>boolean</em>
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

### name

<Property type="property" name="name">
  <template v-slot:type>
    <em>string</em>
  </template>
  <template v-slot:desc>
    Name of the terminal that's displayed on the <Ref to="./node">node</Ref>.
  </template>
</Property>

### node

<Property type="property" name="node">
  <template v-slot:type>
    <em><Ref to="./node">Node</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the <Ref to="./node">Node</Ref> in which this terminal exists.
  </template>
</Property>

### options

<Property type="property" name="options">
  <template v-slot:type>
    <em><Ref to="../interfaces/terminal-options">TerminalOptions</Ref></em>
  </template>
</Property>

### position

<Property type="property" name="position">
  <template v-slot:type>
    <em><Ref to="./vector">Vector</Ref></em>
  </template>
</Property>

### ref

<Property type="property" name="ref">
  <template v-slot:type>
    <em>any</em>
  </template>
  <template v-slot:desc>
    Terminals can hold any user-defined reference using this property (and thereby binding it to this terminal).<br/><br/>
    This is helpful in certain applications for e.g audio connections - a terminal can hold a reference to <a href="https://developer.mozilla.org/en-US/docs/Web/API/AudioNode" target="_blank">WebAudioNode</a><ExternalLinkIcon /> which can be used to connect these AudioNodes when two terminals are connected, almost all nodes inside StandardNodes.Audio package uses this variable.<br/><br/>
    This property may not be relevant for other applications where such a pattern is not used.
  </template>
</Property>

### renderResolver

<Property type="property" name="renderResolver">
  <template v-slot:type>
    <Ref to="../interfaces/render-resolver">RenderResolver</Ref
    >&lt;<Ref to="#class-terminal">Terminal</Ref>,
    <Ref to="../interfaces/terminal-renderparams">TerminalRenderParams</Ref>&gt;
  </template>
  <template v-slot:desc>
  A <Ref to="../interfaces/render-resolver">RenderResolver</Ref> which is scoped to the Terminal instance.

  Any custom render function specified using this resolver will only affect this terminal instance.
  </template>
  <template v-slot:default>() => null</template>
</Property>

### style

<Property type="property" name="style">
  <template v-slot:type>
    <em><Ref to="../interfaces/terminal-style">TerminalStyle</Ref></em>
  </template>
</Property>

### type

<Property type="property" name="type">
  <template v-slot:type>
    <em><Ref to="../enums/terminal-type">TerminalType</Ref></em>
  </template>
</Property>

## Accessors

### propName

<Property type="accessor" name="propName">
  <template v-slot:type>
    <em>string</em>
  </template>
  <template v-slot:desc>
    Binds a prop inside <Ref to="./node#state">Node.state</Ref> to this terminal, whenever the prop value changes, this terminal will set data on all its connectors if its an output terminal.<br/><br/>
    If this is an input terminal, whenever any data is received on it via the connector it changes the prop value inside node's state.
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

### connect

<Method type="method">
  <template v-slot:signature>
    connect(<strong>otherTerminal: </strong><em><Ref to="#class-terminal">Terminal</Ref></em>,
    <strong>style?: </strong><em><Ref to="../interfaces/connector-style">ConnectorStyle</Ref></em>):
    <em>boolean</em>
  </template>
  <template v-slot:params>
    <Param name="otherTerminal">
      <em><Ref to="#class-terminal">Terminal</Ref></em>
    </Param>
    <Param name="style?">
      <em><Ref to="../interfaces/connector-style">ConnectorStyle</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Connects this terminal to another.
  </template>
  <template v-slot:return>
    <em>boolean</em><br/>
    If the connection is successful.
  </template>
</Method>

### disconnect

<Method type="method">
  <template v-slot:signature>
    disconnect(<strong>connector?: </strong><em>string | <Ref to="./connector">Connector</Ref></em>):
    <em>boolean</em>
  </template>
  <template v-slot:params>
    <Param name="connector?">
      <em>string | <Ref to="./connector">Connector</Ref></em><br/>
      <Ref to="./connector#id">Connector.id</Ref> or reference, used only when the terminal on which this method is called is an Output terminal.
    </Param>
  </template>
  <template v-slot:desc>
    Disconnects this terminal from another.<br/><br/>
    If no parameters are passed and the terminal on which this method is called is an output terminal, then all the connections going out from this terminal will be diconnected.
  </template>
  <template v-slot:return>
    <em>boolean</em><br/>
    If the dis-connection is successful.
  </template>
</Method>

### emit

<Method type="method">
  <template v-slot:signature>
    emit(<strong>data: </strong><em>any</em>):
    <em>void</em>
  </template>
  <template v-slot:params>
    <Param name="data">
      <em>any</em>
    </Param>
  </template>
  <template v-slot:desc>
    Calls the <Ref to="#event-event">event</Ref> on all the connected terminals if this is an output terminal and <Ref to="#datatype">dataType</Ref> is 'event'
  </template>
</Method>

### getData

<Method type="method">
  <template v-slot:signature>
    getData():
    <em>any</em>
  </template>
  <template v-slot:desc>
    Gets the data from the connector if this is an input terminal.
  </template>
</Method>

### isConnected

<Method type="method">
  <template v-slot:signature>
    isConnected():
    <em>boolean</em>
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
    <em><Ref to="../interfaces/serialized-terminal">SerializedTerminal</Ref></em>
  </template>
  <template v-slot:inherit>
    <Icon valign="bottom" type="implementation" /> of <Ref to="../interfaces/serializable">Serializable</Ref>.<Ref to="../interfaces/serializable#serialize">serialize</Ref>
  </template>
  <template v-slot:return><em><Ref to="../interfaces/serialized-terminal">SerializedTerminal</Ref></em></template>
</Method>

### setData

<Method type="method">
  <template v-slot:signature>
    setData(<strong>data: </strong><em>any</em>):
    <em>void</em>
  </template>
  <template v-slot:params>
    <Param name="data">
      <em>any</em>
    </Param>
  </template>
  <template v-slot:desc>
    Set the data on all the connectors if this is an output terminal.
  </template>
  <template v-slot:return>
    void
  </template>
</Method>

### deSerialize

<Method type="method-static">
  <template v-slot:signature>
    deSerialize(<strong>node: </strong><em><Ref to="./node">Node</Ref></em>,
    <strong>data: </strong><em><Ref to="../interfaces/serialized-terminal">SerializedTerminal</Ref></em>):
    <em><Ref to="#class-terminal">Terminal</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="node"><em><Ref to="./node">Node</Ref></em></Param>
    <Param name="data"><em><Ref to="../interfaces/serialized-terminal">SerializedTerminal</Ref></em></Param>
  </template>
  <template v-slot:return><em><Ref to="#class-terminal">Terminal</Ref></em></template>
</Method>

## Events

### render <Icon type="event" /> {#event-render}

<Event type="event">
  <template v-slot:desc>
    When a single render cycle completes for this terminal instance.
  </template>
</Event>

### down <Icon type="event" /> {#event-down}

<Event type="event">
  <template v-slot:desc>
    When touch down or mouse left down occurs on the terminal.
  </template>
</Event>

### over <Icon type="event" /> {#event-over}

<Event type="event">
  <template v-slot:desc>
    When mouse over happens on the terminal.
  </template>
</Event>

### enter <Icon type="event" /> {#event-enter}

<Event type="event">
  <template v-slot:desc>
    When mouse enter happens on the terminal.
  </template>
</Event>

### exit <Icon type="event" /> {#event-exit}

<Event type="event">
  <template v-slot:desc>
    When mouse exit happens on the terminal
  </template>
</Event>

### up <Icon type="event" /> {#event-up}

<Event type="event">
  <template v-slot:desc>
    When touch up or mouse left up happens on the terminal.
  </template>
</Event>

### click <Icon type="event" /> {#event-click}

<Event type="event">
  <template v-slot:desc>
    When tap or mouse click happens on the terminal.
  </template>
</Event>

### drag <Icon type="event" /> {#event-drag}

<Event type="event">
  <template v-slot:desc>
    When touch or mouse drag happens on the terminal.
  </template>
</Event>

### rightclick <Icon type="event" /> {#event-rightclick}

<Event type="event">
  <template v-slot:desc>
    When mouse right-click happens on the terminal.
  </template>
</Event>

### connect <Icon type="event" /> {#event-connect}

<Event type="event">
  <template v-slot:desc>
    When this terminal is connected to another.
  </template>
</Event>

### disconnect <Icon type="event" /> {#event-disconnect}

<Event type="event">
  <template v-slot:desc>
    When this terminal is disconnected from another terminal.
  </template>
</Event>

### event <Icon type="event" /> {#event-event}

<Event type="event">
  <template v-slot:desc>
    When this terminal receives an event.
  </template>
</Event>

### emit <Icon type="event" /> {#event-emit}

<Event type="event">
  <template v-slot:desc>
    When this terminal emits an event.
  </template>
</Event>

<script setup>
import data from '../../../../../reflections/api/classes/terminal.json';
</script>
