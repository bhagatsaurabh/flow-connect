## StandardNode: StereoPanner

<img class="zoomable" alt="StereoPanner standard node" src="/images/standard-nodes/audio/stereo-panner.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let stereoPanner = new StandardNodes.Audio.StereoPanner(flow);
```

<br/>

### Default State

```js
{
  pan: 0,
  bypass: false
}
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new StereoPanner(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-stereopanner">StereoPanner</Ref></em>
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
