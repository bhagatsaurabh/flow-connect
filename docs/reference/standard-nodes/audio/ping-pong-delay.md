## StandardNode: PingPongDelay

<img class="zoomable" alt="PingPongDelay standard node" src="/images/standard-nodes/audio/ping-pong-delay.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let pingPongDelay = new StandardNodes.Audio.PingPongDelay(flow);
```

<br/>

### Default State

```js
{
  delayLeft: 200,
  delayRight: 400,
  feedback: 0.3,
  wet: 0.5,
  bypass: false
}
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new PingPongDelay(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>):
    <em><Ref to="#standardnode-pingpongdelay">PingPongDelay</Ref></em>
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
