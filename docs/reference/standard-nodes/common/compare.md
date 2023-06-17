## StandardNode: Compare

<img class="zoomable" alt="Compare standard node" src="/images/standard-nodes/common/compare.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let compare = flow.createNode("common/compare", {
  state: { value: "<" },
});
```

<br/>

### Default State

```js
{
  value: "==";
}
```
