## StandardNode: GlobalEvent

<img class="zoomable" alt="GlobalEvent standard node" src="/images/standard-nodes/common/global-event.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let gEventEmitter = flow.createNode("common/global-event", {
  globalEventType: GlobalEventType.Emitter,
  globalEventName: "reset",
});
let gEventReceiver = flow.createNode("common/global-event", {
  globalEventType: GlobalEventType.Receiver,
  globalEventName: "reset",
});
```

<br/>

### Default State

```js
{
  name: uuid();
}
```

## Options

<pre>
{
  globalEventType: <Ref to="../../api/enums/global-event-type">GlobalEventType</Ref>;
  globalEventName: string;
}
</pre>
