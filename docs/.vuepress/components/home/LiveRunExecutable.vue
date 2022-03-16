<template>
  <canvas class="example-canvas" ref="example-basic-canvas"></canvas>
</template>

<script>
export default {
  name: "LiveRunExecutable",
  props: ["play"],
  mounted() {
    this.flowConnect = new FlowConnect(this.$refs["example-basic-canvas"]);
    window.exeExampleFC = this.flowConnect;
    let flow = this.flowConnect.createFlow({ name: "Graph Execution Example" });

    class DummyNode extends Node {
      constructor(flow, name, position) {
        super(
          flow,
          name || "Node",
          position,
          120,
          [{ name: "in", dataType: "any" }],
          [{ name: "out", dataType: "any" }],
          { state: { status: "Stopped", lastProcessed: -1 } }
        );

        this.setupUI();
        this.button.on("click", () => this.setOutputs(0, "Dummy Data"));
        this.on("process", () => {
          this.state.status = "Processing";
          this.state.lastProcessed = flow.flowConnect.time;
          this.setOutputs(0, "Dummy Data");
        });
        flow.on("stop", () => (this.state.status = "Stopped"));
        flow.flowConnect.on("tick", () => {
          if (this.state.status === "Processing") {
            if (flow.flowConnect.time - this.state.lastProcessed > 250)
              this.state.status = "Idle";
          }
        });
      }

      setupUI() {
        this.style.color = "white";
        this.ui.style.backgroundColor = "black";
        this.ui.style.shadowBlur = 10;
        this.ui.style.shadowColor = "black";

        this.button = this.createButton("Trigger output", {
          height: 20,
          style: {
            backgroundColor: "white",
            color: "black",
            shadowColor: "grey",
          },
        });
        this.ui.append([
          this.createHozLayout([
            this.createLabel("Status:", {
              style: { grow: 0.4, color: "white" },
            }),
            this.createLabel(this.state.status, {
              propName: "status",
              style: { grow: 0.6, color: "white", align: Align.Right },
            }),
          ]),
          this.button,
        ]);
      }
    }
    flow.renderResolver.uiContainer = () => {
      return (context, params, target) => {
        Object.assign(context, {
          fillStyle: target.style.backgroundColor,
          shadowBlur: target.style.shadowBlur,
          shadowColor: target.style.shadowColor,
        });
        context.fillRect(
          params.position.x,
          params.position.y,
          params.width,
          params.height
        );
      };
    };

    let positions = [
      new Vector(510.9, 18),
      new Vector(-298, 82.7),
      new Vector(-96.4, 21.1),
      new Vector(-95.5, 182),
      new Vector(105.2, -62),
      new Vector(105.9, 76.3),
      new Vector(104.4, 221.1),
      new Vector(302, 19.5),
      new Vector(304.4, 153.2),
      new Vector(512, -105.5),
      new Vector(505.1, 153.2),
      new Vector(720.3, 90),
    ];
    for (let i = 0; i < 12; i++) {
      let dummyNode = new DummyNode(flow, "Node " + (i + 1), positions[i]);
    }
    let nodes = [...flow.nodes.values()];
    nodes[5].addTerminal(new Terminal(nodes[5], TerminalType.IN, "any", "in1"));
    nodes[7].addTerminal(new Terminal(nodes[7], TerminalType.IN, "any", "in1"));
    nodes[11].addTerminal(
      new Terminal(nodes[11], TerminalType.IN, "any", "in1")
    );

    nodes[0].outputs[0].connect(nodes[2].inputs[0]);
    nodes[1].outputs[0].connect(nodes[2].inputs[0]);
    nodes[1].outputs[0].connect(nodes[3].inputs[0]);
    nodes[2].outputs[0].connect(nodes[4].inputs[0]);
    nodes[2].outputs[0].connect(nodes[5].inputs[0]);
    nodes[2].outputs[0].connect(nodes[6].inputs[0]);
    nodes[3].outputs[0].connect(nodes[6].inputs[0]);
    nodes[3].outputs[0].connect(nodes[8].inputs[0]);
    nodes[4].outputs[0].connect(nodes[7].inputs[0]);
    nodes[5].outputs[0].connect(nodes[7].inputs[0]);
    nodes[5].outputs[0].connect(nodes[8].inputs[0]);
    nodes[6].outputs[0].connect(nodes[9].inputs[0]);
    nodes[7].outputs[0].connect(nodes[9].inputs[0]);
    nodes[8].outputs[0].connect(nodes[10].inputs[0]);
    nodes[9].outputs[0].connect(nodes[11].inputs[0]);
    nodes[10].outputs[0].connect(nodes[11].inputs[0]);
    nodes[4].outputs[0].connect(nodes[7].inputs[1]);
    nodes[3].outputs[0].connect(nodes[5].inputs[1]);
    nodes[0].outputs[0].connect(nodes[11].inputs[1]);

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
