<template>
  <div class="features">
    <Feature>
      <template v-slot:name>Customizable</template>
      <template v-slot:desc>
        In FlowConnect, almost anything can be customized, from individual
        styling of nodes, terminals, connectors and groups to UIs inside each
        node.<br />
        One can even tap into the render pipeline and entirely take-over !
      </template>
      <template v-slot:live-example>
        <LiveExample snippet="quick-start" default="run">
          <template v-slot:name>basic-example.js</template>
          <template v-slot:run="props">
            <LiveRunCustomizable :play="props.play"></LiveRunCustomizable>
          </template>
          <template v-slot:code>
            <slot name="feature-code-1"></slot>
          </template>
        </LiveExample>
      </template>
    </Feature>
    <Feature align-right="true">
      <template v-slot:name>Event-driven</template>
      <template v-slot:desc>
        Using the good old pub-sub pattern <code>.on | .off</code>, a wide range
        of events can be listened to for e.g. changing dimensions, flow
        execution, processing a node, new/updated input or output, UI updates,
        render cycles and much more<br />
      </template>
      <template v-slot:live-example> </template>
    </Feature>
    <Feature>
      <template v-slot:name>Reactive</template>
      <template v-slot:desc>
        Every node has its own reactive state, is two-way bindable with any
        input/output or UI component, comes with inbuilt and customizable prop
        validation and can be watched for changes
      </template>
      <template v-slot:live-example> </template>
    </Feature>
    <Feature align-right="true">
      <template v-slot:name>Executable</template>
      <template v-slot:desc>
        In FlowConnect, every Flow can be executed, which simply means, nodes
        are processed based on their dependencies, every Flow dynamically
        constructs/updates a similar internal representation of what is rendered
        on screen but optimized and ready for execution
      </template>
      <template v-slot:live-example> </template>
    </Feature>
  </div>
</template>

<script setup>
import Feature from "./Feature.vue";
import LiveExample from "./LiveExample.vue";
import Markdown from "./Markdown.vue";
import LiveRunCustomizable from "./LiveRunCustomizable.vue";
</script>
<script>
export default {
  name: "Features",
  components: [Feature],
};
</script>

<style scoped>
.features {
  max-width: 80vw;
  margin: auto;
}
.feature {
  padding-left: 0;
  padding-right: 0;
}

@media (max-width: 419px) {
  .features {
    flex-direction: column;
  }
}
@media (max-width: 700px) {
  .features {
    max-width: 90vw;
  }
}
</style>
