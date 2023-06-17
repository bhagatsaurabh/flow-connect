## StandardNode: ADSR

<img class="zoomable" alt="ADSR standard node" src="/images/standard-nodes/audio/adsr.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let adsr = flow.createNode("audio/adsr", {});
```

<br/>

### Default State

```js
{
  min: 0,
  max: 1,
  a: 0.4, d: 0.2, s: 0.6, r: 0.4,
  trigger: false
}
```
