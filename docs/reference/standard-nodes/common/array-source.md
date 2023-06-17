## StandardNode: ArraySource

<img class="zoomable" alt="ArraySource standard node" src="/images/standard-nodes/common/array-source.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let arraySource = flow.createNode("common/array-source", {
  state: { number: true },
});
```

<br/>

### Default State

```js
{
  number: true,
  range: false,
  min: 0,
  max: 100,
  step: 0.1
}
```
