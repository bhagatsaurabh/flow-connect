## StandardNode: GlobalEvent

<img class="zoomable" alt="GlobalEvent standard node" src="/images/standard-nodes/common/global-event.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let gEventEmitter = new StandardNodes.Common.GlobalEvent(
  flow,
  GlobalEventType.Emitter,
  'reset',
  {}
);
let gEventReceiver = new StandardNodes.Common.GlobalEvent(
  flow,
  GlobalEventType.Receiver,
  'reset',
  {}
);
```

<br/>

### Default State

```js
{ name: null, prevEvent: '', eventId: -1 }
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new GlobalEvent(<strong>flow: </strong><em><Ref to="../api/classes/flow">Flow</Ref></em>,
    <strong>type: </strong><em><Ref to="../../api/enums/global-event-type">GlobalEventType</Ref></em>,
    <strong>name: </strong><em>string</em>
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-globalevent">GlobalEvent</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flow">
      <em><Ref to="../../api/classes/flow">Flow</Ref></em>
    </Param>
    <Param name="type">
      <em><Ref to="../../api/enums/global-event-type">GlobalEventType</Ref></em>
    </Param>
    <Param name="name">
      <em>string</em>
    </Param>
    <Param name="options?">
      <em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>
      <template v-slot:default-value>
        <em>{}</em>
      </template>
    </Param>
  </template>
</Method>
