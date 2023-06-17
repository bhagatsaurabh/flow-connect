<template>
  <li class="param">
    <strong><Optional class="mr-0p5" v-if="name.includes('?')" /></strong>
    <strong class="mr-1">{{ name.replace("?", "") }}</strong>
    <slot></slot><br />
    <Badge v-if="$slots['default-value']" class="mr-1 bg-grey" text="default" vertical="middle" type="tip" />
    <slot name="default-value"></slot>
  </li>
</template>

<script setup>
import Optional from "./Optional.vue";
</script>
<script>
export default {
  name: "Param",
  props: ["name"],
};
</script>

<style>
ul li.param:not(:first-child) {
  margin-top: 1rem;
}
</style>
