## StandardNode: Distorter

<img class="zoomable" alt="Distorter standard node" src="/images/standard-nodes/audio/distorter.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let distorter = flow.createNode("audio/distorter", {});
```

<br/>

### Default State

```js
{
  oversample: 'none',
  amount: 50,
  bypass: false
}
```
