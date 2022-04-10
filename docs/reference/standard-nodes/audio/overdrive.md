## StandardNode: Overdrive

<img class="zoomable" alt="Overdrive standard node" src="/images/standard-nodes/audio/overdrive.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let overdriveEffect = new StandardNodes.Audio.OverdriveEffect(flow);
```

<br/>

### Default State

```js
{
  drive: 0.197,
  outGain: -9.154,
  curveAmount: 0.979,
  algorithm: 1,
  bypass: false
}
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new OverdriveEffect(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-overdrive">OverdriveEffect</Ref></em>
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
