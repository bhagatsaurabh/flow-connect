## StandardNode: Moog

<img class="zoomable" alt="Moog standard node" src="/images/standard-nodes/audio/moog.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let moogEffect = new StandardNodes.Audio.MoogEffect(flow);
```

<br/>

### Default State

```js
{
  cutoff: 0.065,
  resonance: 3.5,
  bypass: false
}
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new MoogEffect(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-moog">MoogEffect</Ref></em>
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
