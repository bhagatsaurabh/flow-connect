<template>
  <button class="action-button" :class="{ primary: primary, secondary: secondary }">
    <router-link :to="to">
      <slot></slot>
    </router-link>
  </button>
</template>

<script>
export default {
  name: "ActionButton",
  props: {
    to: { default: "/" },
    primary: { type: Boolean, default: false },
    secondary: { type: Boolean, default: false },
  },
  methods: {
    clicked() {
      this.$emit("click");
    },
  },
};
</script>

<style scoped>
.action-button {
  border-radius: 999px;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 1rem 2rem;
  transition: background-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}
.action-button a {
  transition: color 0.3s ease;
}
.action-button:hover {
  box-shadow: 0 0 25px var(--c-block-shadow);
}
.primary {
  background-color: var(--c-brand);
}
.primary a {
  color: #fff;
}
.secondary {
  border: 2px solid var(--c-brand);
  background-color: transparent;
}
.secondary:hover {
  background-color: var(--c-brand);
}
.secondary:hover a {
  color: #fff;
}
</style>
