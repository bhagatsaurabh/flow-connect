## StandardNode: LineChartMini

<img class="zoomable" alt="LineChartMini standard node" src="/images/standard-nodes/visual/line-chart-mini.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let chart = flow.createNode("visual/line-chart-mini", {
  name: "Example",
  width: 250,
  displayHeight: 100,
  displayStyle: { backgroundColor: "#7a7a7a" },
});
```

<br/>

### Default State

```js
{
  size: 10;
  colors: ["#ff6666", "#66d4ff"];
}
```

## Options

<pre>
{
  displayHeight: number;
  displayStyle: <Ref to="../../api/interfaces/display-style">DisplayStyle</Ref>;
}
</pre>
