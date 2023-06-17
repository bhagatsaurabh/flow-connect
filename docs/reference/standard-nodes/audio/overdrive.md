## StandardNode: Overdrive

<img class="zoomable" alt="Overdrive standard node" src="/images/standard-nodes/audio/overdrive.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let overdriveEffect = flow.createNode("audio/overdrive", {});
```

<br/>

### Default State

```js
{
  drive: 0.197,
  outGain: -9.154,
  curveAmount: 0.979,
  algorithm: 1,
  bypass: false
}
```
