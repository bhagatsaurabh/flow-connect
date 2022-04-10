## StandardNode: LineChartMini

<img class="zoomable" alt="LineChartMini standard node" src="/images/standard-nodes/visual/line-chart-mini.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let chart = new StandardNodes.Visual.LineChartMini(
  flow, 100,
  ['#ff6666', '#66d4ff'],
  { backgroundColor: '#7a7a7a' },
  { name: 'Example', width: 250 }
);
```

<br/>

### Default State

```js
{ size: 10 }
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new LineChartMini(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>height: </strong><em>number</em>,
    <strong>colors: </strong><em>string[]</em>,
    <strong>displayStyle: </strong><em><Ref to="../../api/interfaces/display-style">DisplayStyle</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-linechartmini">LineChartMini</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flow">
      <em><Ref to="../../api/classes/flow">Flow</Ref></em>
    </Param>
    <Param name="height">
      <em>number</em>
    </Param>
    <Param name="colors">
      <em>string[]</em>
    </Param>
    <Param name="displayStyle">
      <em><Ref to="../../api/interfaces/display-style">DisplayStyle</Ref></em>
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
