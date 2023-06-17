import { FlowConnect } from "flow-connect";
import { Vector, Node } from "flow-connect/core";

let flowConnect = new FlowConnect(document.getElementById("canvas"));
let flow = flowConnect.createFlow({ name: "Graph Execution Example" });

class DummyNode extends Node {
  setupIO() {
    this.addTerminals([
      { type: TerminalType.IN, name: "in", dataType: "any" },
      { type: TerminalType.OUT, name: "out", dataType: "any" },
    ]);
  }
  created() {
    this.state = { status: "Stopped", lastProcessed: -1 };
    this.width = 120;

    this.setupUI();
    this.button.on("click", () => this.setOutputs(0, "Dummy Data"));
    this.on("process", () => {
      this.state.status = "Processing";
      this.state.lastProcessed = flow.flowConnect.time;
      this.setOutputs(0, "Dummy Data");
    });
    this.flow.on("stop", () => (this.state.status = "Stopped"));
    this.flow.on("tick", () => {
      if (this.state.status === "Processing") {
        if (flow.flowConnect.time - this.state.lastProcessed > 250) this.state.status = "Idle";
      }
    });
  }
  process() {}

  setupUI() {
    this.style.color = "white";
    Object.assign(this.ui.style, { backgroundColor: "black", shadowBlur: 10, shadowColor: "black" });

    this.button = this.createButton("Trigger output", {
      height: 20,
      style: { backgroundColor: "white", color: "black", shadowColor: "grey" },
    });
    this.ui.append([
      this.createHozLayout([
        this.createLabel("Status:", { style: { grow: 0.4, color: "white" } }),
        this.createLabel(this.state.status, {
          propName: "status",
          style: { grow: 0.6, color: "white", align: Align.Right },
        }),
      ]),
      this.button,
    ]);
  }
}
FlowConnect.register({ type: "node", name: "my-custom/dummy-node" }, DummyNode);

flow.renderers.background = () => {
  return (context, params, target) => {
    Object.assign(context, {
      fillStyle: target.style.backgroundColor,
      shadowBlur: target.style.shadowBlur,
      shadowColor: target.style.shadowColor,
    });
    context.fillRect(params.position.x, params.position.y, params.width, params.height);
  };
};

let positions = [
  Vector.create(510.9, 18),
  Vector.create(-298, 82.7),
  Vector.create(-96.4, 21.1),
  Vector.create(-95.5, 182),
  Vector.create(105.2, -62),
  Vector.create(105.9, 76.3),
  Vector.create(104.4, 221.1),
  Vector.create(302, 19.5),
  Vector.create(304.4, 153.2),
  Vector.create(512, -105.5),
  Vector.create(505.1, 153.2),
  Vector.create(720.3, 90),
];
for (let i = 0; i < 12; i++) {
  flow.createNode("my-custom/dummy-node", positions[i], { name: "Node " + (i + 1) });
}

let nodes = [...flow.nodes.values()];
nodes[5].addTerminal(new Terminal(nodes[5], TerminalType.IN, "any", "in1"));
nodes[7].addTerminal(new Terminal(nodes[7], TerminalType.IN, "any", "in1"));
nodes[11].addTerminal(new Terminal(nodes[11], TerminalType.IN, "any", "in1"));

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

flowConnect.render(flow);
