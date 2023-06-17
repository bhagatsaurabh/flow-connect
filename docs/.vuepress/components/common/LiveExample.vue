<template>
  <div class="live-example">
    <div class="live-example-nav">
      <div class="live-example-name">
        <slot name="name"></slot>
      </div>
      <div class="live-example-controls">
        <div ref="runButton" @click="runClicked" class="live-example-button" title="Run Demo" data-title="Run">
          <img alt="Run" src="/images/play-icon.png" />
        </div>
        <div
          ref="codeButton"
          @click="codeClicked"
          class="live-example-button active"
          title="See Code"
          data-title="Code"
        >
          <img alt="Code" src="/images/code-icon.png" />
          <img alt="Copy" src="/images/copy-icon.png" />
        </div>
      </div>
    </div>
    <div ref="code" class="live-example-code">
      <slot name="code"></slot>
    </div>
    <div ref="run" class="live-example-run">
      <slot name="run" :play="isGraphPlaying"></slot>
      <GraphControls ref="graph-controls" @control="handleControl" />
    </div>
  </div>
</template>

<script setup>
import GraphControls from "./GraphControls.vue";
</script>
<script>
export default {
  name: "LiveExample",
  components: [GraphControls],
  mounted() {
    if (this.default === "code") this.codeClicked();
    else this.runClicked();

    fetch(`snippets/${this.snippet}.js`)
      .then((res) => res.text())
      .then((text) => (this.snippetText = text));

    this.$refs.codeButton.addEventListener("animationend", () => this.copyActionAnimEnd());
  },
  props: {
    snippet: String,
    default: { default: "code" },
    play: false,
  },
  watch: {
    play(newVal) {
      if (!newVal && !this.isGraphPlaying) return;
      this.$refs["graph-controls"].buttonClicked("play");
    },
  },
  data() {
    return {
      isGraphPlaying: false,
      currView: "",
      snippetText: "",
    };
  },
  methods: {
    runClicked() {
      if (this.currView !== "run") {
        this.$refs.code.classList.remove("live-example-visible");
        this.$refs.code.classList.add("live-example-hidden");
        this.$refs.run.classList.remove("live-example-hidden");
        this.$refs.run.classList.add("live-example-visible");
        this.$refs.runButton.classList.add("active");
        this.$refs.codeButton.classList.remove("active");
        this.currView = "run";

        this.$refs.codeButton.title = "See Code";
      }
    },
    codeClicked() {
      if (this.currView !== "code") {
        this.$refs.run.classList.remove("live-example-visible");
        this.$refs.run.classList.add("live-example-hidden");
        this.$refs.code.classList.remove("live-example-hidden");
        this.$refs.code.classList.add("live-example-visible");
        this.$refs.codeButton.classList.add("active");
        this.$refs.runButton.classList.remove("active");
        this.currView = "code";

        this.$refs.codeButton.title = "Copy";
      } else {
        this.$refs.codeButton.classList.add("anim-copy");

        navigator.clipboard.writeText(this.snippetText);
      }
    },
    handleControl(controlName) {
      if (controlName === "play") {
        this.isGraphPlaying = !this.isGraphPlaying;
      }
    },
    copyActionAnimEnd() {
      this.$refs.codeButton.classList.remove("anim-copy");
    },
  },
};
</script>

<style scoped>
.live-example {
  height: 60vh;
  position: relative;
  box-shadow: 0 0 20px var(--c-block-shadow);
  transition: box-shadow 0.3s ease;
}
.live-example-nav {
  background-color: #000;
  height: 3rem;
  color: rgb(216, 216, 216);
  line-height: 3rem;
  font-size: 0.9rem;
  display: flex;
}
.live-example-name {
  text-align: left;
  font-weight: 600;
  margin: 0;
  padding-left: 1rem;
  flex-grow: 1;
  border-bottom: 1px solid #bbb;
}
.live-example-controls {
  display: flex;
  height: 100%;
}
.live-example-button {
  position: relative;
  overflow: hidden;
  height: 100%;
  display: inline-block;
  width: 3rem;
  box-sizing: border-box;
  padding: 0.6rem;
  border-left: 1px solid #bbb;
  line-height: calc(3rem - 1px);
  background-color: #000;
  transition: background-color 0.3s ease, border-bottom 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  background-position: center;
  background-size: 50%;
  background-repeat: no-repeat;
  border-bottom: 1px solid #bbb;
}
.live-example-button::after {
  content: attr(data-title);
  position: absolute;
  background-color: inherit;
  right: 0;
  text-align: center;
  top: -100%;
  width: inherit;
  transition: top 0.3s ease;
  font-weight: bold;
}
.live-example-button:hover::after {
  top: 0;
}
.live-example-button.active {
  background-color: #282c34;
  border-bottom: 1px solid #282c34;
}
.live-example-button:first-child.active {
  background-color: white;
  border-bottom-color: white;
}
.live-example-button:first-child.active::after {
  color: #000;
}
.live-example-button:first-child img {
  transition: filter 0.3s ease;
}
.live-example-button:first-child.active img {
  filter: invert(1);
}
.live-example-button:last-child img:first-child {
  transition: opacity 0.3s ease;
  opacity: 1;
}
.live-example-button:last-child img:nth-child(2) {
  transition: opacity 0.3s ease;
  position: relative;
  top: -3rem;
  opacity: 0;
}
.live-example-button:last-child.active img:nth-child(2) {
  opacity: 1;
}
.live-example-button:last-child.active img:first-child {
  opacity: 0;
}
.live-example-button:last-child.active::after {
  content: "Copy";
}
.live-example-code {
  position: absolute;
  width: 100%;
  height: calc(100% - 3rem);
  opacity: 1;
  transition: opacity 0.3s ease;
}
.live-example-run {
  text-align: left;
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: calc(100% - 3rem);
  border-left: 1px solid;
  border-right: 1px solid;
  border-bottom: 1px solid;
  overflow: hidden;
  opacity: 1;
  transition: opacity 0.3s ease;
}
.live-example-visible {
  opacity: 1;
  pointer-events: all;
}
.live-example-hidden {
  opacity: 0;
  pointer-events: none;
}
.live-example-button:last-child::before {
  position: absolute;
  transition: right 0.3s ease;
  background-color: inherit;
  top: 0;
  text-align: center;
  right: -3rem;
  width: 1.8rem;
  padding: 0.6rem;
  background-repeat: no-repeat;
  z-index: 1;
  height: 1.8rem;
  background-size: 60%;
  background-position: center;
  transition: right 0.3s ease;
  background-image: url(/images/done-icon.png);
  content: url(/images/done-icon.png);
}
.anim-copy::before {
  animation-name: slide-in-out;
  animation-duration: 1s;
  animation-timing-function: ease-in-out;
}
@keyframes slide-in-out {
  0% {
    right: -3rem;
  }
  20% {
    right: 0rem;
  }
  80% {
    right: 0rem;
  }
  100% {
    right: 3rem;
  }
}
</style>
