## StandardNode: NumberSource

<img class="zoomable" alt="NumberSource standard node" src="/images/standard-nodes/common/number-source.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let number = flow.createNode("common/number-source", {
  state: { fractional: true, value: 0.042 },
});
```

<br/>

### Default State

```js
{ fractional: false, value: 0 }
```
