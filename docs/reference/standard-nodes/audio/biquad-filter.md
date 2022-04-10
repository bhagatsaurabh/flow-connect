## StandardNode: BiquadFilter

<img class="zoomable" alt="BiquadFilter standard node" src="/images/standard-nodes/audio/biquad-filter.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let biquadFilter = new StandardNodes.Audio.BiquadFilter(flow);
```

<br/>

### Default State

```js
{ filterType: 'lowpass', bypass: false }
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new BiquadFilter(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-biquadfilter">BiquadFilter</Ref></em>
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
