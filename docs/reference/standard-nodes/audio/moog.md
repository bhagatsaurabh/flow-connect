## StandardNode: Moog

<img class="zoomable" alt="Moog standard node" src="/images/standard-nodes/audio/moog.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let moogEffect = flow.createNode("audio/moog", {});
```

<br/>

### Default State

```js
{
  cutoff: 0.065,
  resonance: 3.5,
  bypass: false
}
```
