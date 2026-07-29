<script setup>
import { onMounted, ref, watch } from "vue";
import GraphControls from "./GraphControls.vue";

const props = defineProps({
  snippet: String,
  default: { default: "code" },
  play: false,
});

const isGraphPlaying = ref(false);
const currView = ref("");
const snippetText = ref("");
const runButton = ref(null);
const codeButton = ref(null);
const run = ref(null);
const code = ref(null);
const graphControls = ref(null);

const runClicked = () => {
  if (currView.value !== "run") {
    code.value.classList.remove("live-example-visible");
    code.value.classList.add("live-example-hidden");
    run.value.classList.remove("live-example-hidden");
    run.value.classList.add("live-example-visible");
    runButton.value.classList.add("active");
    codeButton.value.classList.remove("active");
    currView.value = "run";

    codeButton.value.title = "See Code";
  }
};
const codeClicked = () => {
  if (currView.value !== "code") {
    run.value.classList.remove("live-example-visible");
    run.value.classList.add("live-example-hidden");
    code.value.classList.remove("live-example-hidden");
    code.value.classList.add("live-example-visible");
    codeButton.value.classList.add("active");
    runButton.value.classList.remove("active");
    currView.value = "code";

    codeButton.value.title = "Copy";
  } else {
    codeButton.value.classList.add("anim-copy");

    navigator.clipboard.writeText(snippetText.value);
  }
};
const handleControl = (controlName) => {
  if (controlName === "play") {
    isGraphPlaying.value = !isGraphPlaying.value;
  }
};
const copyActionAnimEnd = () => {
  codeButton.value.classList.remove("anim-copy");
};

watch(() => props.play, (newVal) => {
  if (!newVal && !isGraphPlaying.value) return;
  graphControls.value.buttonClicked("play");
})

onMounted(() => {
  if (props.default === "code") codeClicked();
  else runClicked();

  fetch(`snippets/${props.snippet}.js`)
    .then((res) => res.text())
    .then((text) => (snippetText.value = text));

  codeButton.value.addEventListener("animationend", () => copyActionAnimEnd());
})
</script>

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
        <div ref="codeButton" @click="codeClicked" class="live-example-button active" title="See Code"
          data-title="Code">
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
      <GraphControls ref="graphControls" @control="handleControl" />
    </div>
  </div>
</template>

<style scoped>
.live-example {
  height: 60vh;
  position: relative;
  box-shadow: 0 0 25px -5px var(--c-block-shadow);
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
