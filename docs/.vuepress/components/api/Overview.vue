<template>
  <ul class="list">
    <li v-for="item in data.constructors" :key="item">
      <router-link to="#constructor">
        <Icon :type="item.type" />
        <span>{{ item.name }}</span>
      </router-link>
    </li>
  </ul>
  <h3>Properties</h3>
  <ul class="list">
    <li v-for="item in data.properties" :key="item">
      <router-link :to="'#' + item.name.toLowerCase()">
        <Icon :type="item.type" />
        <span>{{ item.name }}</span>
      </router-link>
    </li>
  </ul>
  <h3>Accessors</h3>
  <ul class="list">
    <li v-for="item in data.accessors" :key="item">
      <router-link :to="'#' + item.name.toLowerCase()">
        <Icon :type="item.type" />
        <span>{{ item.name }}</span>
      </router-link>
    </li>
  </ul>
  <h3>Methods</h3>
  <ul class="list">
    <li v-for="item in data.methods" :key="item">
      <router-link :to="'#' + item.name.toLowerCase()">
        <Icon :type="item.type" />
        <span>{{ item.name }}</span>
      </router-link>
    </li>
  </ul>
</template>

<script setup>
import Icon from "./Icon.vue";
</script>
<script>
export default {
  name: "Overview",
  props: ["data"],
};
</script>

<style scoped>
.list {
  column-count: 3;
  column-gap: 3rem;
  list-style: none;
}
.list li a {
  white-space: nowrap;
}

@media (max-width: 945px) {
  .list {
    column-count: 2;
  }
}
@media (max-width: 490px) {
  .list {
    column-count: 1;
  }
}
</style>
