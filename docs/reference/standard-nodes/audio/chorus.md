## StandardNode: Chorus

<img class="zoomable" alt="Chorus standard node" src="/images/standard-nodes/audio/chorus.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let chorusEffect = flow.createNode("audio/chorus", {});
```

<br/>

### Default State

```js
{
  feedback: 0.4,
  delay: 0.0045,
  depth: 0.7,
  rate: 0.01,
  bypass: false
}
```
