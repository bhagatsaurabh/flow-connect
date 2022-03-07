<template>
  <article class="mt-1">
    <section>
      <template v-if="$slots.signature">
        <Icon :type="type" />
        <code><slot name="signature"></slot></code><br /><br />
      </template>
      <slot v-if="$slots.inherit" name="inherit"></slot>
    </section>
    <section v-if="$slots.desc">
      <slot name="desc"></slot>
    </section>
    <section>
      <template v-if="$slots.params">
        <h4>Parameters</h4>
        <ul>
          <slot name="params"></slot>
        </ul>
      </template>
      <h4 v-if="$slots.return" class="d-inline-block mb-0 mr-1">Returns</h4>
      <em><slot name="return"></slot></em>
    </section>
    <section v-if="$slots.example">
      <h4>Example</h4>
      <slot name="example"></slot>
    </section>
  </article>
</template>

<script setup>
import Icon from "./Icon.vue";
</script>
<script>
export default {
  name: "Method",
  props: ["type"],
};
</script>

<style scoped>
</style>
