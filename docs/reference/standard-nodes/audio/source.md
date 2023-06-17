## StandardNode: Source

<img class="zoomable" alt="Source standard node" src="/images/standard-nodes/audio/source.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let audioSource = flow.createNode("audio/source", {});
```

<br/>

### Default State

```js
{
  file: null,
  buffer: null,
  loop: true
}
```
