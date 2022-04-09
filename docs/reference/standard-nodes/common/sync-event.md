## StandardNode: SyncEvent

<img class="zoomable" alt="SyncEvent standard node" src="/images/standard-nodes/common/sync-event.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let sync = new StandardNodes.Common.SyncEvent(flow, {}, 4);
```

<br/>

### Default State

```js
{}
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new SyncEvent(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>,
    <strong>events?: </strong><em>number</em>):
    <em><Ref to="#standardnode-syncevent">SyncEvent</Ref></em>
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
    <Param name="events?">
      <em>number</em>
    </Param>
  </template>
</Method>

<script setup>
import Method from "../../../../../components/api/Method.vue";
import Param from "../../../../../components/api/Param.vue";
import Ref from "../../../../../components/api/Ref.vue";
import Hierarchy from "../../../../../components/api/Hierarchy.vue";
</script>
