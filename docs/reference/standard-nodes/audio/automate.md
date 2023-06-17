## StandardNode: Automate

<img class="zoomable" alt="Automate standard node" src="/images/standard-nodes/audio/automate.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let automate = flow.createNode("audio/automate", {
  state: { min: 20, max: 800, value: 20 },
});
```

<br/>

### Default State

```js
{
  min: 0,
  max: 1,
  value: 0.5,
  duration: 1,
  auto: true,
  loop: false
}
```

## Options

<pre>
{
  envelope: <Ref to="../../api/classes/vector">Vector</Ref>[];
}
</pre>
