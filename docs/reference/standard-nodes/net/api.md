## StandardNode: API

<img class="zoomable" alt="API standard node" src="/images/standard-nodes/net/api.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let api = flow.createNode("net/api", {
  state: {
    src: "https://public.example.com/data",
  },
});
```

<br/>

### Default State

```js
{
  src: "";
}
```
