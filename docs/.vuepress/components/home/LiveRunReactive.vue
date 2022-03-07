<template>
  <canvas class="example-canvas" ref="example-basic-canvas"></canvas>
</template>

<script>
export default {
  name: "LiveRunReactive",
  props: ["play"],
  mounted() {
    this.flowConnect = new FlowConnect(this.$refs["example-basic-canvas"]);
    window.reactiveExampleFC = this.flowConnect;
    let flow = this.flowConnect.createFlow({ name: "Reactive Example" });

    let stringSource = new StandardNodes.Common.StringSource(flow, {
      state: { value: "Sample String" },
      position: new Vector2(41.1, -3.5),
    });
    let numberSource = new StandardNodes.Common.NumberSource(flow, {
      state: { value: 100 },
      position: new Vector2(46.8, 93.2),
    });
    let booleanSource = new StandardNodes.Common.BooleanSource(flow, {
      state: { value: false },
      position: new Vector2(60.3, 218),
    });
    let log = new StandardNodes.Common.Log(flow, {
      position: new Vector2(665.1, 64.3),
    });
    log.addNewTerminal("data");
    log.addNewTerminal("data");

    let customNode = flow.createNode(
      "Custom Node",
      new Vector2(369.1, 70.7),
      170,
      {
        state: { stringValue: "", numberValue: 0, boolValue: false },
        style: { spacing: 20 },
      }
    );
    customNode.ui.append([
      customNode.createHozLayout(
        [
          customNode.createLabel("String", { style: { grow: 0.4 } }),
          customNode.createLabel(customNode.state.stringValue, {
            propName: "stringValue",
            input: true,
            output: true,
            style: { grow: 0.6 },
          }),
        ],
        { style: { spacing: 10 } }
      ),
      customNode.createHozLayout(
        [
          customNode.createLabel("Number", { style: { grow: 0.4 } }),
          customNode.createInput({
            value: customNode.state.numberValue,
            propName: "numberValue",
            input: true,
            output: true,
            height: 20,
            style: { type: InputType.Number, grow: 0.6 },
          }),
        ],
        { style: { spacing: 10 } }
      ),
      customNode.createHozLayout(
        [
          customNode.createLabel("Boolean", { style: { grow: 0.4 } }),
          customNode.createToggle({
            propName: "boolValue",
            input: true,
            output: true,
            height: 10,
            style: { grow: 0.2 },
          }),
        ],
        { style: { spacing: 10 } }
      ),
    ]);
    customNode.watch("stringValue", (oldVal, newVal) => {
      console.log(
        "Watcher for prop 'stringValue': Old:",
        oldVal,
        "New:",
        newVal
      );
    });
    customNode.watch("numberValue", (oldVal, newVal) => {
      console.log(
        "Watcher for prop 'numberValue': Old:",
        oldVal,
        "New:",
        newVal
      );
    });
    customNode.watch("boolValue", (oldVal, newVal) => {
      console.log("Watcher for prop 'boolValue': Old:", oldVal, "New:", newVal);
    });

    stringSource.outputsUI[0].connect(customNode.inputsUI[0]);
    numberSource.outputsUI[1].connect(customNode.inputsUI[1]);
    booleanSource.outputsUI[0].connect(customNode.inputsUI[2]);
    customNode.outputsUI[0].connect(log.inputs[1]);
    customNode.outputsUI[1].connect(log.inputs[2]);
    customNode.outputsUI[2].connect(log.inputs[3]);

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
