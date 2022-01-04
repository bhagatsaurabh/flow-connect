<template>
  <div class="quick-start-title">
    <h1>Quick Start</h1>
    <h4>
      FlowConnect is a visual programming framework for creating node-based
      interfaces that are reactive, event-driven, customizable and
      executable.
    </h4>
  </div>
</template>

<script>
export default {
  name: "QuickStart",
};
</script>

<style scoped>
.quick-start-title {
  padding-top: 4rem;
}
.quick-start-title h1 {
  padding-bottom: 1rem;
  text-align: center;
  border-bottom: 1px solid grey;
  max-width: 70vw;
  margin-left: auto;
  margin-right: auto;
}
.quick-start-title h4 {
  opacity: 0.7;
  margin: auto;
  max-width: 65vw;
  text-align: center;
}

@media (max-width: 419px) {
  .quick-start-title h4 {
    max-width: 100vw;
  }
  .quick-start-step {
    max-width: 100vw;
  }
}
@media (max-width: 700px) {
  .quick-start-title h4 {
    max-width: 90vw;
  }
  .quick-start-step {
    max-width: 90vw;
  }
}
</style>

