## StandardNode: Delay

<img class="zoomable" alt="Delay standard node" src="/images/standard-nodes/audio/delay.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let delayEffect = new StandardNodes.Audio.DelayEffect(flow);
```

<br/>

### Default State

```js
{
  feedback: 0.45,
  cutoff: 20000,
  wet: 0.5,
  dry: 1,
  delayTime: 100,
  bypass: false
}
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new DelayEffect(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-delay">DelayEffect</Ref></em>
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

<script setup>
import Method from "../../../../../components/api/Method.vue";
import Param from "../../../../../components/api/Param.vue";
import Ref from "../../../../../components/api/Ref.vue";
import Hierarchy from "../../../../../components/api/Hierarchy.vue";
</script>
