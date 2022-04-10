# StandardNodes.UI

<ul class="list">
  <li v-for="item in data.classes" :key="item">
    <router-link :to="item.link">
      <Icon type="class" />
      <span>{{ item.name }}</span>
    </router-link>
  </li>
</ul>

<script setup>
import data from "../../../../reflections/standard-nodes/ui.json";
import Icon from "../../../../components/api/Icon.vue";
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
