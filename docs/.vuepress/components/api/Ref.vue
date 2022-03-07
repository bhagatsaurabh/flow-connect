<template>
  <router-link v-bind="$attrs">
    <strong><slot></slot></strong>
  </router-link>
</template>

<script>
export default {
  name: "Ref",
  props: ["name"],
};
</script>
