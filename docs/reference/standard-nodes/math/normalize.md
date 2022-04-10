## StandardNode: Normalize

<img class="zoomable" alt="Normalize standard node" src="/images/standard-nodes/math/normalize.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let normalize = new StandardNodes.Math.Normalize(
  flow,
  'array',
  { state: { relative: true, constant: 5 } }
);
```

<br/>

### Default State

```js
{
  min: 0,
  max: 100,
  relative: false
}
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new Normalize(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>type: </strong><em>'number' | 'array'</em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-normalize">Normalize</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flow">
      <em><Ref to="../../api/classes/flow">Flow</Ref></em>
    </Param>
    <Param name="type">
      <em>'number' | 'array'</em>
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
