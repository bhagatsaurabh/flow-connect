<template>
  <div class="features">
    <Feature>
      <template v-slot:name>Customizable</template>
      <template v-slot:desc>
        In FlowConnect, almost anything can be customized, from individual
        styling of nodes, terminals, connectors, and groups to UIs inside each
        node, or tap into the render pipeline and take over entirely!
      </template>
      <template v-slot:live-example="props">
        <LiveExample :play="props.play" snippet="custom-example" default="run">
          <template v-slot:name>custom-example.js</template>
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
        of events can be listened to, e.g. changing dimensions, flow execution,
        processing a node, new/updated input or output, UI updates, render
        cycles, and much more<br />
      </template>
      <template v-slot:live-example="props">
        <LiveExample :play="props.play" snippet="event-example" default="run">
          <template v-slot:name>event-example.js</template>
          <template v-slot:run="props">
            <LiveRunEvent :play="props.play"></LiveRunEvent>
          </template>
          <template v-slot:code>
            <slot name="feature-code-2"></slot>
          </template>
        </LiveExample>
      </template>
    </Feature>
    <Feature>
      <template v-slot:name>Reactive</template>
      <template v-slot:desc>
        Every node has its own reactive state, is two-way bindable with any
        input/output or UI component, and can be watched for changes
      </template>
      <template v-slot:live-example="props">
        <LiveExample
          :play="props.play"
          snippet="reactive-example"
          default="run"
        >
          <template v-slot:name>reactive-example.js</template>
          <template v-slot:run="props">
            <LiveRunReactive :play="props.play"></LiveRunReactive>
          </template>
          <template v-slot:code>
            <slot name="feature-code-3"></slot>
          </template>
        </LiveExample>
      </template>
    </Feature>
    <Feature align-right="true">
      <template v-slot:name>Executable</template>
      <template v-slot:desc>
        In FlowConnect, every Flow is executable and nodes are
        processed based on their dependencies, every Flow dynamically
        constructs/updates an internal 'graph' of what is shown on
        screen but optimized and ready for execution
      </template>
      <template v-slot:live-example="props">
        <LiveExample
          :play="props.play"
          snippet="executable-example"
          default="run"
        >
          <template v-slot:name>executable-example.js</template>
          <template v-slot:run="props">
            <LiveRunExecutable :play="props.play"></LiveRunExecutable>
          </template>
          <template v-slot:code>
            <slot name="feature-code-4"></slot>
          </template>
        </LiveExample>
      </template>
    </Feature>
  </div>
</template>

<script setup>
import Feature from "./Feature.vue";
import LiveExample from "./LiveExample.vue";
import Markdown from "./Markdown.vue";
import LiveRunCustomizable from "./LiveRunCustomizable.vue";
import LiveRunEvent from "./LiveRunEvent.vue";
import LiveRunReactive from "./LiveRunReactive.vue";
import LiveRunExecutable from "./LiveRunExecutable.vue";
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
