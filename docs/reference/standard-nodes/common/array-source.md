## StandardNode: ArraySource

<img class="zoomable" alt="ArraySource standard node" src="/images/standard-nodes/common/array-source.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let arraySource = new StandardNodes.Common.ArraySource(
  flow,
  { state: { number: true } }
);
```

<br/>

### Default State

```js
{
  number: true,
  range: false,
  min: 0, max: 100,
  step: 0.1,
  value: []
}
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new ArraySource(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-arraysource">ArraySource</Ref></em>
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
