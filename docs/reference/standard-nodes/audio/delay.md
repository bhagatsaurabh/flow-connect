## StandardNode: Delay

<img class="zoomable" alt="Delay standard node" src="/images/standard-nodes/audio/delay.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let delayEffect = flow.createNode("audio/delay", {});
```

<br/>

### Default State

```js
{
  feedback: 0.45,
  cutoff: 20000,
  wet: 0.5,
  dry: 1,
  delayTime: 100,
  bypass: false
}
```
