<template>
  <article class="mt-1">
    <section v-if="$slots.desc">
      <slot name="desc"></slot>
    </section>
    <section v-if="$slots.example">
      <h4>Example</h4>
      <slot name="example"></slot>
    </section>
  </article>
</template>

<script setup></script>
<script>
export default {
  name: "Event",
};
</script>

<style scoped></style>
