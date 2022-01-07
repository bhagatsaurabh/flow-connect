<template>
  <div
    ref="feature-container"
    :class="{ 'align-right': alignRight }"
    class="feature-container"
  >
    <div class="feature-title">
      <h2>
        <slot name="name"></slot>
      </h2>
    </div>
    <div class="feature-desc" :class="{ 'align-right': alignRight }">
      <h5>
        <slot name="desc"></slot>
      </h5>
    </div>
    <div class="feature-live">
      <div class="feature-live-control">
        <div
          @click="controlClicked"
          ref="control-icon"
          class="control-icon"
        ></div>
      </div>
      <div ref="live-example" class="feature-live-content">
        <slot name="live-example" :play="isLiveOpen"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Feature",
  data() {
    return {
      isLiveOpen: false,
    };
  },
  props: {
    alignRight: { default: false },
  },
  methods: {
    controlClicked() {
      if (!this.isLiveOpen) {
        this.$refs["live-example"].style.maxHeight = "50vh";
        this.$refs["live-example"].style.minHeight = "50vh";
        this.$refs["control-icon"].classList.add("flip");

        setTimeout(
          () =>
            this.$refs["feature-container"].scrollIntoView({
              block: "start",
              behavior: "smooth",
            }),
          0
        );
      } else {
        this.$refs["live-example"].style.maxHeight = "0";
        this.$refs["live-example"].style.minHeight = "0";
        this.$refs["control-icon"].classList.remove("flip");
      }
      this.isLiveOpen = !this.isLiveOpen;
    },
  },
};
</script>

<style scoped>
.align-right {
  text-align: right;
}
.feature-container {
  width: 100%;
  margin-bottom: 3rem;
}
.feature-title {
  margin-top: 5rem;
}
.feature-title h2 {
  font-size: 1.7rem;
  border-bottom: none;
  padding-bottom: 0;
}
.feature-desc h5 {
  margin-bottom: 1.5rem;
  max-width: 60vw;
}
.feature-desc.align-right h5 {
  margin-left: auto;
}
.feature-live {
  margin-bottom: 1rem;
}
.feature-live-control {
  height: calc(2rem - 2.5px);
  border-bottom: 5px solid var(--c-text);
  transition: border-bottom 0.3s ease;
}
.control-icon {
  z-index: 1;
  margin: auto;
  height: 1.5rem;
  width: 1.5rem;
  background-position: center;
  background-size: 50%;
  background-repeat: no-repeat;
  padding: 1rem;
  /* border-radius: 3rem; */
  border: 2px solid var(--c-text);
  background-color: #000;
  position: relative;
  background-image: url("/images/expand-icon.png");
  cursor: pointer;
  transition: box-shadow 0.3s ease, transform 0.3s ease, border 0.3s ease;
  box-shadow: 0 0 20px var(--c-block-shadow);
}
.control-icon.flip {
  transform: rotateX(180deg);
}
.feature-live-content {
  max-height: 0;
  min-height: 0;
  overflow: hidden;
  transition: max-height 0.2s ease-out, min-height 0.2s ease-out;
  background-color: #f1f1f1;
  box-shadow: 0 0 20px var(--c-block-shadow);
}

@media (max-width: 419px) {
  .feature-live {
    margin-left: -1.5rem;
    margin-right: -1.5rem;
  }
  .feature-desc h5 {
    max-width: 100vw;
  }
}
@media (max-width: 700px) {
  .feature-live {
    margin-left: -1.5rem;
    margin-right: -1.5rem;
  }
  .feature-desc h5 {
    max-width: 70vw;
  }
}
</style>
