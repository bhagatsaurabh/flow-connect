<template>
  <canvas class="example-canvas" ref="example-basic-canvas"></canvas>
</template>

<script>
export default {
  name: "LiveRunBasic",
  props: ["play"],
  mounted() {
    this.flowConnect = new FlowConnect(this.$refs["example-basic-canvas"]);
    window.basicExampleFC = this.flowConnect;
    let flow = this.flowConnect.createFlow({ name: "Basic Example", rules: {} });

    let timerNode = flow.createNode("custom/timer", Vector.create(45, 7), { width: 500 });

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

    let numberSource = flow.createNode("common/number-source", Vector.create(245, 128), {
      state: { value: 100 },
    });

    let labelNode = flow.createNode("core/label", Vector.create(755, 119), { name: "Label", width: 120 });
    labelNode.ui.append(
      labelNode.createUI("core/label", { text: "", input: true, style: { precision: 2, fontSize: "14px" } })
    );

    timerNode.outputs[0].connect(randomNode.inputs[0]);
    randomNode.outputs[0].connect(multiplyNode.inputs[0]);
    numberSource.outputs[0].connect(multiplyNode.inputs[1]);
    multiplyNode.outputs[0].connect(labelNode.inputsUI[0]);

    this.flowConnect.render(flow);
  },
  watch: {
    play(newVal) {
      if (newVal) {
        this.flowConnect.currFlow.start();
      } else {
        this.flowConnect.currFlow.stop();
      }
    },
  },
};
</script>

<style scoped>
.example-canvas {
  width: 100%;
  height: 100%;
  background-color: white;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}
</style>
