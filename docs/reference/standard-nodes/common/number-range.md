## StandardNode: NumberRange

<img class="zoomable" alt="NumberRange standard node" src="/images/standard-nodes/common/number-range.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let numberRange = new StandardNodes.Common.NumberRange(
  flow,
  {
    state: {
      value: -5 * Math.PI,
      min: -5 * Math.PI,
      max: 5 * Math.PI,
      step: 0.1
    }
  }
);
```

<br/>

### Default State

```js
{
  value: 0,
  min: 0,
  max: 100,
  step: 1,
  loop: false
}
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new NumberRange(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-numberrange">NumberRange</Ref></em>
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
