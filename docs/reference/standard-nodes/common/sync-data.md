## StandardNode: SyncData

<img class="zoomable" alt="SyncData standard node" src="/images/standard-nodes/common/sync-data.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let syncData = flow.createNode("common/sync-data", {
  state: { syncType: "partial" },
  noOfInputs: 3,
});
```

<br/>

### Default State

```js
{
  syncType: "partial";
}
```

## Options

<pre>
{
  noOfInputs: number
}
</pre>
