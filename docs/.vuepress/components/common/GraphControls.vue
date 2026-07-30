<script setup>
import { useTemplateRef } from 'vue';

defineProps({ showText: { type: Boolean, default: true } });
const emit = defineEmits(['control']);

const graphPlayIconText = useTemplateRef('graph-play-icon-text');
const graphPlayIcon = useTemplateRef('graph-play-icon');

const buttonClicked = (name) => {
  if (name === "play") {
    if (graphPlayIconText.value.innerText.trim() === "Run") {
      const iconEl = graphPlayIcon.value;
      iconEl.classList.remove("graph-icon-play");
      iconEl.classList.add("graph-icon-stop");
      graphPlayIconText.value.innerText = "Stop";
    } else {
      const iconEl = graphPlayIcon.value;
      iconEl.classList.remove("graph-icon-stop");
      iconEl.classList.add("graph-icon-play");
      graphPlayIconText.value.innerText = "Run";
    }
  }
  emit("control", name);
}
</script>

<template>
  <div class="graph-controls">
    <div @click="buttonClicked('play')" class="graph-control-button">
      <div ref="graph-play-icon" class="graph-control-button-icon graph-icon-play"></div>
      <div :class="{ 'display-none': !showText }" ref="graph-play-icon-text" class="graph-control-button-text">Run</div>
    </div>
  </div>
</template>

<style scoped>
.graph-controls {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 2rem;
  border-top: 2px solid;
  border-left: 2px solid;
  border-right: 2px solid;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  box-sizing: border-box;
  box-shadow: 0 0 4px darkgray;
  background-color: white;
}

.graph-control-button {
  cursor: pointer;
  height: calc(100% + 1px);
  position: relative;
  top: -0.5px;
  display: flex;
  transition: background-color 0.2s ease;
  padding-right: 1rem;
}

.graph-control-button:first-child {
  padding-left: 1rem;
  border-top-left-radius: 6px;
}

.graph-control-button:last-child {
  border-top-right-radius: 6px;
}

.graph-control-button:hover .graph-control-button-icon {
  filter: invert(1) drop-shadow(0.5px 1px 1.5px black);
}

.graph-control-button-icon {
  transition: filter 0.2s linear;
  filter: invert(1);
  background-position: center;
  background-size: 100%;
  background-repeat: no-repeat;
  height: 100%;
  width: 1.2rem;
}

.graph-icon-play {
  background-image: url("/images/play-icon.png");
}

.graph-icon-stop {
  background-image: url("/images/stop-icon.png");
}

.graph-control-button-text {
  height: 100%;
  color: #000;
  line-height: 1.7rem;
  margin-left: 0.2rem;
}

.display-none {
  display: none;
}
</style>
