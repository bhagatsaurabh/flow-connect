## StandardNode: Normalize

<img class="zoomable" alt="Normalize standard node" src="/images/standard-nodes/math/normalize.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let normalize = flow.createNode("math/normalize", {
  normalizationType: "array",
  state: { relative: true, constant: 5 },
});
```

<br/>

### Default State

```js
{
  min: 0,
  max: 100,
  relative: false,
  constant: false,
  normalizationType: "array"
}
```

## Options

<pre>
{
  normalizationType: "number" | "array";
}
</pre>
