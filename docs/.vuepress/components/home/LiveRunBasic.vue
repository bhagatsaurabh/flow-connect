<script setup>
import { onMounted, useTemplateRef, watch, ref } from 'vue';
import { FlowConnect } from 'flow-connect';
import { Vector, Node } from 'flow-connect/core';
import { NumberSource } from '@flow-connect/common';

const props = defineProps(["play"]);

const flowConnect = ref();
const exampleBasicCanvas = useTemplateRef('example-basic-canvas')

watch(() => props.play, (newVal) => {
  if (newVal) {
    flowConnect.value.currFlow.start();
  } else {
    flowConnect.value.currFlow.stop();
  }
})

onMounted(() => {
  flowConnect.value = new FlowConnect(exampleBasicCanvas.value);
  window.basicExampleFC = flowConnect.value;
  let flow = flowConnect.value.createFlow({ name: "Basic Example", rules: {} });

  class CustomTimerNode extends Node {
    timerId = -1;

    setupIO() {
      this.addTerminals([{ type: TerminalType.OUT, name: "trigger", dataType: "event" }]);
    }
    created(options) {
      const { interval = 1000 } = options;
      this.state = { interval };
      this.width = 100;

      this.flow.on("start", () => {
        this.outputs[0].emit();
        this.timerId = setInterval(() => this.outputs[0].emit(), this.state.interval);
      });
      this.flow.on("stop", () => clearInterval(this.timerId));
    }
    process() { }
  }
  FlowConnect.register({ type: "node", name: "custom/timer-node" }, CustomTimerNode);

  let timerNode = flow.createNode("custom/timer-node", Vector.create(45, 7), { width: 500 });

  let randomNode = flow.createNode("core/empty", Vector.create(285, 50), {
    name: "Random",
    width: 120,
    inputs: [{ name: "trigger", dataType: "event" }],
    outputs: [{ name: "random", dataType: "number" }],
  });
  randomNode.inputs[0].on("event", () => {
    randomNode.setOutputs({ random: Math.random() });
  });

  let multiplyNode = flow.createNode("core/empty", Vector.create(552, 76), {
    name: "Multiply",
    width: 100,
    inputs: [
      { name: "a", dataType: "number" },
      { name: "b", dataType: "number" },
    ],
    outputs: [{ name: "result", dataType: "number" }],
  });
  multiplyNode.on("process", () => {
    let a = multiplyNode.getInput("a");
    let b = multiplyNode.getInput("b");
    multiplyNode.setOutputs({
      result: a * b,
    });
  });

  let numberSource = new NumberSource(Vector.create(245, 128), {
    state: { value: 100 },
  });

  let labelNode = flow.createNode("core/empty", Vector.create(755, 119), { name: "Label", width: 120 });
  labelNode.ui.append(
    labelNode.createUI("core/label", { text: "", input: true, style: { precision: 2, fontSize: "14px" } })
  );

  timerNode.outputs[0].connect(randomNode.inputs[0]);
  randomNode.outputs[0].connect(multiplyNode.inputs[0]);
  numberSource.outputs[0].connect(multiplyNode.inputs[1]);
  multiplyNode.outputs[0].connect(labelNode.inputsUI[0]);

  flowConnect.value.render(flow);
});
</script>

<template>
  <canvas class="example-canvas" ref="example-basic-canvas"></canvas>
</template>

<style scoped>
.example-canvas {
  width: 100%;
  height: 100%;
  background-color: white;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}
</style>
