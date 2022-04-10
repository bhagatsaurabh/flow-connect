## StandardNode: Tremolo

<img class="zoomable" alt="Tremolo standard node" src="/images/standard-nodes/audio/tremolo.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let tremoloEffect = new StandardNodes.Audio.TremoloEffect(flow);
```

<br/>

### Default State

```js
{
  intensity: 0.3,
  stereoPhase: 0,
  rate: 5,
  bypass: false
}
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new TremoloEffect(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-tremolo">TremoloEffect</Ref></em>
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
