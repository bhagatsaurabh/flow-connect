## StandardNode: Automate

<img class="zoomable" alt="Automate standard node" src="/images/standard-nodes/audio/automate.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let automate = new StandardNodes.Audio.Automate(
  flow,
  { state: { min: 20, max: 800, value: 20 } }
);
```

<br/>

### Default State

```js
{
  min: 0, max: 1,
  value: 0.5,
  duration: 1,
  auto: true,
  loop: false
}
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new Automate(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>,
    <strong>envelope?: </strong><em><Ref to="../../api/classes/vector">Vector</Ref>[]</em>):
    <em><Ref to="#standardnode-automate">Automate</Ref></em>
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
    <Param name="envelope?">
      <em><Ref to="../../api/classes/vector">Vector</Ref>[]</em>
      <template v-slot:default-value>
        <em>[new Vector(.2, .5), new Vector(.5, .8), new Vector(.9, .2)]</em>
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
