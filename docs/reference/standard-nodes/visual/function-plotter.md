## StandardNode: FunctionPlotter

<img class="zoomable" alt="FunctionPlotter standard node" src="/images/standard-nodes/visual/function-plotter.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let plotter = flow.createNode("visual/function-plotter", {
  displayHeight: 250,
});
```

<br/>

### State

```js
{
  polar: false;
}
```

## Options

<pre>
{
  plotStyle: <Ref to="../../api/interfaces/plot-style">PlotStyle</Ref>;
  displayHeight: number;
}
</pre>
