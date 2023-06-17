## StandardNode: NumberRange

<img class="zoomable" alt="NumberRange standard node" src="/images/standard-nodes/common/number-range.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let numberRange = flow.createNode("common/number-range", {
  state: {
    min: -5 * Math.PI,
    max: 5 * Math.PI,
    step: 0.1,
    loop: false,
  },
});
```

<br/>

### Default State

```js
{
  min: 0,
  max: 100,
  step: 1,
  loop: false
}
```
