<script setup>
defineProps(['name']);
</script>

<template>
  <router-link v-bind="$attrs">
    <strong>
      <slot></slot>
    </strong>
  </router-link>
</template>
