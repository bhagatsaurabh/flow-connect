## StandardNode: FunctionPlotter

<img class="zoomable" alt="FunctionPlotter standard node" src="/images/standard-nodes/visual/function-plotter.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let plotter = new StandardNodes.Visual.FunctionPlotter(flow, 250);
```

<br/>

### Default State

```js
{
  points: [],
  polar: false
}
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new FunctionPlotter(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>height: </strong><em>number</em>,
    <strong>plotStyle?: </strong><em><Ref to="../../api/interfaces/plot-style">PlotStyle</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-functionplotter">FunctionPlotter</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flow">
      <em><Ref to="../../api/classes/flow">Flow</Ref></em>
    </Param>
    <Param name="height">
      <em>number</em>
    </Param>
    <Param name="plotStyle?">
      <em><Ref to="../../api/interfaces/plot-style">PlotStyle</Ref></em>
      <template v-slot:default-value>
        <em>{}</em>
      </template>
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
