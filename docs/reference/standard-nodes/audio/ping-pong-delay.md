## StandardNode: PingPongDelay

<img class="zoomable" alt="PingPongDelay standard node" src="/images/standard-nodes/audio/ping-pong-delay.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let pingPongDelay = flow.createNode("audio/ping-pong-delay", {});
```

<br/>

### Default State

```js
{
  delayLeft: 200,
  delayRight: 400,
  feedback: 0.3,
  wet: 0.5,
  bypass: false
}
```
