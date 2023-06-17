## StandardNode: Timer

<img class="zoomable" alt="Timer standard node" src="/images/standard-nodes/common/timer.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let timer = flow.createNode("common/timer", {
  state: { delay: 500 },
});
```

<br/>

### Default State

```js
{ delay: 1000, emitValue: null }
```
