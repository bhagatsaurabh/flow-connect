# Class: Hooks

Hooks is a general purpose class used by <Ref to="./flow-connect">FlowConnect</Ref>, <Ref to="./flow">Flow</Ref>, <Ref to="./node">Node</Ref>, <Ref to="./ui-node">UINode</Ref>, <Ref to="./terminal">Terminal</Ref>, <Ref to="./group">Group</Ref>... classes for making their normal processes available as events to listen to when they happen.

For e.g. A Terminal's `connect`/`disconnect` event can be listened to do some custom stuff.

You can also register and listen to your custom events.

## Overview

<Overview :data="data" />

## Constructor

<Method type="constructor">
  <template v-slot:signature>
    new Hooks():
    <em><Ref to="#class-hooks">Hooks</Ref></em>
  </template>
</Method>

## Properties

### registeredEvents

<Property type="property-protected" name="registeredEvents">
  <template v-slot:type>
    <em><Ref to="../interfaces/record">Record</Ref>&lt;string, <Ref to="../interfaces/record">Record</Ref>&lt;number, (...args: any) => void&gt;&gt;</em>
  </template>
  <template v-slot:desc>
    Collection of all the registered events and their callbacks as a result of calling <Ref to="#on">on</Ref>.<br/><br/>
    Example structure:

  ```js
  {
    // 'eventKey': {}
    connect: {
      // 'id': 'callback'
      0: () => {/*...*/},
      5: () => {/*...*/},
    },
    render: {
      0: () => {/*...*/},
      1: () => {/*...*/},
      4: () => {/*...*/},
    }
    //...
  }
  ```

  </template>
</Property>

## Methods

### call

<Method type="method">
  <template v-slot:signature>
    call(<strong>eventKey: </strong><em>string</em>, <strong>...args: </strong><em>any</em>):
    <em>void</em>
  </template>
  <template v-slot:params>
    <Param name="eventKey">
      <em>string</em><br/>
      Name of the event to call.
    </Param>
    <Param name="...args">
      <em>any</em><br/>
      Any arguments that needs to be forwarded to registered callbacks.
    </Param>
  </template>
  <template v-slot:example>
    For e.g. Calling a custom event on a <Ref to="./terminal">terminal</Ref>.<br/>
    
  ```js
  terminal.on('my-custom-event', (myArg1, myArg2) => {
    doSomeCustomThing(myArg1, myArg2);
  });

  // ...

  terminal.call('my-custom-event', myArg1, myArg2);
  ```
  </template>
  <template v-slot:return>
    <em>void</em>
  </template>
</Method>

### off

<Method type="method-inherited">
  <template v-slot:signature>
    off(<strong>eventKey: </strong><em>string</em>, <strong>id: </strong><em>number</em>):
    <em>void</em>
  </template>
  <template v-slot:params>
    <Param name="eventKey">
      <em>string</em><br/>
      Name of the event to de-register.
    </Param>
    <Param name="id">
      <em>number</em><br/>
      A numbered id that was generated at the time of event registration using <Ref to="#on">on</Ref>.
    </Param>
  </template>
  <template v-slot:desc>
    De-register a callback on an event.
  </template>
  <template v-slot:return>
    void
  </template>
</Method>

### offAll

<Method type="method-inherited">
  <template v-slot:signature>
    offAll():
    <em>void</em>
  </template>
  <template v-slot:desc>
    De-register all the events.
  </template>
  <template v-slot:return>
    void
  </template>
</Method>

### on

<Method type="method-inherited">
  <template v-slot:signature>
    on(<strong>eventKey: </strong><em>string</em>, <strong>callback: </strong><em>(...args: any) => void</em>):
    <em>number</em>
  </template>
  <template v-slot:desc>
    Register a callback on an event.
  </template>
  <template v-slot:params>
    <Param name="eventKey">
      <em>string</em><br/>
      Name of the event on which a callback needs to be registered.
    </Param>
    <Param name="callback">
      <em><Function class="mr-0p5" />(...args: any) => void</em><br/>
      The callback.
    </Param>
  </template>
  <template v-slot:example>
    Registering a callback on <Ref to="./terminal">terminal's</Ref> `disconnect` event.
    
  ```js
  terminal.on('disconnect', () => {
    doSomeThing();
  });
  ```
  </template>
  <template v-slot:return>
    number<br/>

  A numbered id for the specified event that can be used later on when de-registering callbacks using <Ref to="#off">off</Ref>.
  </template>
</Method>

<script setup>
import data from '../../../../../reflections/api/classes/hooks.json';
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
