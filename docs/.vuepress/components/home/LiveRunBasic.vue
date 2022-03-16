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
    let flow = this.flowConnect.createFlow({ name: "Basic Example" });

    let timerNode = new TimerNode(flow, new Vector(45, 7), 500);

    let randomNode = flow.createNode("Random", new Vector(285, 50), 120, {
      inputs: [{ name: "trigger", dataType: "event" }],
      outputs: [{ name: "random", dataType: "number" }],
    });
    randomNode.inputs[0].on("event", () => {
      randomNode.setOutputs({ random: Math.random() });
    });

    let multiplyNode = new Node(
      flow,
      "Multiply",
      new Vector(552, 76),
      100,
      [
        { name: "a", dataType: "number" },
        { name: "b", dataType: "number" },
      ],
      [{ name: "result", dataType: "number" }]
    );
    multiplyNode.on("process", () => {
      let a = multiplyNode.getInput("a");
      let b = multiplyNode.getInput("b");
      multiplyNode.setOutputs({
        result: a * b,
      });
    });

    let numberSource = new StandardNodes.Common.NumberSource(flow, {
      position: new Vector(245, 128),
      state: { value: 100 },
    });

    let labelNode = flow.createNode("Label", new Vector(755, 119), 120, [], []);
    labelNode.ui.append(
      labelNode.createLabel("", { input: true, style: { precision: 2, fontSize: '14px' } })
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
