## StandardNode: Equalizer

<img class="zoomable" alt="Equalizer standard node" src="/images/standard-nodes/audio/equalizer.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let equalizer = flow.createNode("audio/equalizer", {});
```

<br/>

### Default State

```js
{
  eq1: 0, eq2: 0,
  eq3: 0, eq4: 0,
  eq5: 0, eq6: 0,
  eq7: 0, eq8: 0,
  eq9: 0, eq10: 0,
  bypass: false
}
```
