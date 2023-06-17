## StandardNode: Oscillator

<img class="zoomable" alt="Oscillator standard node" src="/images/standard-nodes/audio/oscillator.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let oscillator = flow.createNode("audio/oscillator", {});
```

<br/>

### Default State

```js
{
  frequency: 440,
  detune: 0,
  type: 'sine'
}
```
