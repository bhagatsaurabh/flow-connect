## StandardNode: ADSR

<img class="zoomable" alt="ADSR standard node" src="/images/standard-nodes/audio/adsr.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let adsr = new StandardNodes.Audio.ADSR(flow);
```

<br/>

### Default State

```js
{
  min: 0,
  max: 1,
  a: 0.4, d: 0.2, s: 0.6, r: 0.4,
  trigger: false
}
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new ADSR(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-adsr">ADSR</Ref></em>
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
