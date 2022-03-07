<template>
  <article class="mt-1 mb-1">
    <section class="mb-1">
      <Icon :type="type" />
      <Badge
        v-for="item in extras"
        :key="item"
        class="mr-1"
        type="warning"
        vertical="middle"
        ><strong>{{ item }}</strong></Badge
      >
      <code
        ><strong>{{ name }}: </strong><slot name="type"></slot
      ></code>
    </section>
    <section>
      <slot name="desc"></slot>
    </section>
    <section v-if="$slots.default">
      <h5 class="mb-1">default:</h5>
      <em><slot name="default"></slot></em>
    </section>
  </article>
</template>

<script setup>
import Icon from "./Icon.vue";
</script>
<script>
export default {
  name: "Property",
  props: ["type", "name", "extras"],
};
</script>

<style scoped>
</style>
