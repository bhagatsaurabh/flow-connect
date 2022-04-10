## StandardNode: Buffer

<img class="zoomable" alt="Buffer standard node" src="/images/standard-nodes/common/buffer.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let buffer = new StandardNodes.Common.Buffer(
  flow,
  { state: { size: 300 } }
);
```

<br/>

### Default State

```js
{ buffer: [], size: 10 }
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new Buffer(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-buffer">Buffer</Ref></em>
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
  </template>
</Method>
