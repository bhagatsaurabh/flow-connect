## StandardNode: BiquadFilter

<img class="zoomable" alt="BiquadFilter standard node" src="/images/standard-nodes/audio/biquad-filter.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let biquadFilter = flow.createNode("audio/biquad-filter", {});
```

<br/>

### Default State

```js
{ filterType: 'lowpass', bypass: false }
```
