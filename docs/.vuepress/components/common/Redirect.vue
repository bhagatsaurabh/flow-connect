<template>
Redirecting...
</template>

<script>
export default {
  props: ['to'],
  created() {
    this.$router.push(this.to);
  }
}
</script>

