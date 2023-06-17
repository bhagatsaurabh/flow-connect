## StandardNode: StereoPanner

<img class="zoomable" alt="StereoPanner standard node" src="/images/standard-nodes/audio/stereo-panner.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let stereoPanner = flow.createNode("audio/stereo-panner", {});
```

<br/>

### Default State

```js
{
  pan: 0,
  bypass: false
}
```
