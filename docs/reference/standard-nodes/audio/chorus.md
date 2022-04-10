## StandardNode: Chorus

<img class="zoomable" alt="Chorus standard node" src="/images/standard-nodes/audio/chorus.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let chorusEffect = new StandardNodes.Audio.ChorusEffect(flow);
```

<br/>

### Default State

```js
{
  feedback: 0.4,
  delay: 0.0045,
  depth: 0.7,
  rate: 0.01,
  bypass: false
}
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new ChorusEffect(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-chorus">ChorusEffect</Ref></em>
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
