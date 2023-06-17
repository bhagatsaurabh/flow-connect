## StandardNode: Dial

<img class="zoomable" alt="Dial standard node" src="/images/standard-nodes/ui/dial.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let dial = flow.createNode("ui/dial", {
  state: { min: 0, max: 2, value: 0.5 },
});
```

<br/>

### Default State

```js
{
  value: 0,
  min: 0,
  max: 1
}
```

## Options

<pre>
{
  height: number;
  dialStyle?: <Ref to="../../api/interfaces/dial-style">DialStyle</Ref>;
}
</pre>
