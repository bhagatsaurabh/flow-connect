## StandardNode: Buffer

<img class="zoomable" alt="Buffer standard node" src="/images/standard-nodes/common/buffer.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let buffer = flow.createNode("common/buffer", {
  state: { size: 300 },
});
```

<br/>

### Default State

```js
{ buffer: [], size: 10 }
```
