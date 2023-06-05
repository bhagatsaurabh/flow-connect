import { FlowConnect } from "flow-connect";
import { Vector, Node } from "flow-connect/core";

// Create an instance of FlowConnect by passing it a reference of <div> or <canvas> element
let flowConnect = new FlowConnect(document.getElementById("canvas"));
// Create a Flow (which is a container of nodes that you will create)
let flow = flowConnect.createFlow({ name: "Basic Example", rules: {} });

/* Create a custom node */
class CustomTimerNode extends Node {
  timerId = -1;
  constructor(flowInstance, position, interval) {
    super(flowInstance, "Timer", position, 100, [], [{ name: "trigger", dataType: "event" }], {
      state: { interval },
    });

    flowInstance.on("start", () => {
      this.outputs[0].emit();
      this.timerId = setInterval(() => this.outputs[0].emit(), this.state.interval);
    });
    flowInstance.on("stop", () => clearInterval(this.timerId));
  }
}

/* Register this new custom node with a unique name */
FlowConnect.register({ type: "node", name: "my-custom/timer-node" }, CustomTimerNode);

/* Create new node using previously registered node type */
let timerNode = flow.createNode("my-custom/timer-node", Vector.create(45, 7), { width: 500 });

/* Or, you can create a node using generic 'core/empty' type */
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
  multiplyNode.setOutputs({ result: a * b });
});

/* There are also a whole set of pre-configured nodes for specific uses */
let numberSource = flow.createNode("common/number-source", Vector.create(245, 128), {
  state: { value: 100 },
});

let labelNode = flow.createNode("core/empty", Vector.create(755, 119), { name: "Label", width: 120 });
labelNode.ui.append(
  labelNode.createUI("core/label", { text: "", input: true, style: { precision: 2, fontSize: "14px" } })
);

// Connect all the nodes
timerNode.outputs[0].connect(randomNode.inputs[0]);
randomNode.outputs[0].connect(multiplyNode.inputs[0]);
numberSource.outputs[0].connect(multiplyNode.inputs[1]);
multiplyNode.outputs[0].connect(labelNode.inputsUI[0]);

/* Specify which Flow to render on the canvas
 * you can create any number of flows, but only one can be rendered at a time */
flowConnect.render(flow);

// Now you can go ahead and run this example ^
