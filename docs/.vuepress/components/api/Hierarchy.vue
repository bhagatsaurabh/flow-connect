<template>
  <div class="mt-1">
    <template v-if="extend">
      <Badge class="mr-1" type="tip" vertical="middle">extends</Badge>
      <router-link :to="extend.link">{{ extend.name }}</router-link>
    </template>
    <div v-if="implement && extend"></div>
    <template v-if="implement">
      <Badge class="mr-1" type="tip" vertical="middle">implements</Badge>
      <router-link class="mr-0p5" v-for="item in implement" :key="item.name" :to="item.link"><em>{{
        item.name
      }}</em></router-link>
    </template>
  </div>
</template>

<script>
export default {
  name: "Hierarchy",
  props: ["extend", "implement"],
};
</script>

<style scoped>
</style>
