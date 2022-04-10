## StandardNode: FrequencyAnalyser

<img class="zoomable" alt="FrequencyAnalyser standard node" src="/images/standard-nodes/audio/frequency-analyser.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let frequencyAnalyser = new StandardNodes.Audio.FrequencyAnalyser(flow);
```

<br/>

### Default State

```js
{ fftSize: 11, currFreq: 0 }
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new FrequencyAnalyser(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-frequencyanalyser">FrequencyAnalyser</Ref></em>
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
