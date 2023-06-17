## StandardNode: Func

<img class="zoomable" alt="Func standard node" src="/images/standard-nodes/math/func.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let func = flow.createNode("math/func", {
  expression: "sin(t) + 0.2cos(2.8t)",
});
```

<br/>

### Default State

```js
{
  newVar: "y";
  expression: "a*sin(a^2)+cos(a*tan(a))";
}
```

## Options

<pre>
{
  expression?: string;
}
</pre>
