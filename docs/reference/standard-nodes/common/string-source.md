## StandardNode: StringSource

<img class="zoomable" alt="StringSource standard node" src="/images/standard-nodes/common/string-source.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let string = flow.createNode("common/string-source", {
  state: { value: "Sample String" },
});
```

<br/>

### Default State

```js
{
  value: "";
}
```
