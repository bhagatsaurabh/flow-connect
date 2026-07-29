<script setup>
import Icon from "./Icon.vue";
import Ref from "./Ref.vue";

defineProps(["name", "member", "value", "refpath"]);
</script>

<template>
  <article class="mt-1 mb-1">
    <section class="mb-1">
      <Icon type="enum" />
      <Ref :to="'#enum-' + refpath">{{ name }}</Ref>.<em>{{ member }}</em> = <em>{{ value }}</em>
    </section>
  </article>
</template>
