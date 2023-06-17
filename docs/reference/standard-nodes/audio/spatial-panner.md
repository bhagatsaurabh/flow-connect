## StandardNode: SpatialPanner

<img class="zoomable" alt="SpatialPanner standard node" src="/images/standard-nodes/audio/spatial-panner.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let spatialPanner = flow.createNode("audio/spatial-panner", {});
```

<br/>

### Default State

```js
{
  value: Vector.create(.5, .5),
  z: -1,
  bypass: false
}
```
