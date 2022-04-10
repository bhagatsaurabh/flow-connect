## StandardNode: Equalizer

<img class="zoomable" alt="Equalizer standard node" src="/images/standard-nodes/audio/equalizer.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let equalizer = new StandardNodes.Audio.Equalizer(flow);
```

<br/>

### Default State

```js
{
  eq1: 0, eq2: 0,
  eq3: 0, eq4: 0,
  eq5: 0, eq6: 0,
  eq7: 0, eq8: 0,
  eq9: 0, eq10: 0,
  bypass: false
}
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new Equalizer(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-equalizer">Equalizer</Ref></em>
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
