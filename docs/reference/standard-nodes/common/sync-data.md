## StandardNode: SyncData

<img class="zoomable" alt="SyncData standard node" src="/images/standard-nodes/common/sync-data.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let syncData = new StandardNodes.Common.SyncData(
  flow,
  { state: { syncType: 'partial' } },
  3
);
```

<br/>

### Default State

```js
{ syncType: 'partial' }
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new SyncData(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>,
    <strong>inputs?: </strong><em>number</em>):
    <em><Ref to="#standardnode-syncdata">SyncData</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flow">
      <em><Ref to="../../api/classes/flow">Flow</Ref></em>
    </Param>
    <Param name="options?">
      <em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>
      <template v-slot:default-value>
        <em>{}</em>
      </template>
    </Param>
    <Param name="inputs?">
      <em>number</em>
    </Param>
  </template>
</Method>
