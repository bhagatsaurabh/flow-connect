<script setup>

defineProps(["type", "valign"]);
</script>

<template>
  <img :title="type" class="api-icon mr-0p5" :alt="type" :src="`images/${type}.png`"
    :class="{ 'v-align-bottom': !!valign ? valign : false }" />
</template>
