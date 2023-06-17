## StandardNode: Tremolo

<img class="zoomable" alt="Tremolo standard node" src="/images/standard-nodes/audio/tremolo.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let tremoloEffect = flow.createNode("audio/tremolo", {});
```

<br/>

### Default State

```js
{
  intensity: 0.3,
  stereoPhase: 0,
  rate: 5,
  bypass: false
}
```
