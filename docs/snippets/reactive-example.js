import { FlowConnect } from 'flow-connect';
import { Vector2 } from 'flow-connect/core/vector';
import StandardNodes from 'flow-connect/standard-nodes';

let flowConnect = new FlowConnect(document.getElementById('canvas'));
let flow = flowConnect.createFlow({ name: "Reactivity Example" });

let stringSource = new StandardNodes.Common.StringSource(flow, {
  // Any node can have a reactive state
  state: { value: "Sample String" },
  position: new Vector2(41.1, -3.5)
});
let numberSource = new StandardNodes.Common.NumberSource(flow, {
  state: { value: 100 },
  position: new Vector2(46.8, 93.2)
});
let booleanSource = new StandardNodes.Common.BooleanSource(flow, {
  state: { value: false },
  position: new Vector2(60.3, 218)
});
let log = new StandardNodes.Common.Log(flow, { position: new Vector2(665.1, 64.3) });
log.addNewTerminal("data");
log.addNewTerminal("data");

let customNode = flow.createNode("Custom Node", new Vector2(369.1, 70.7), 170, {
  state: { stringValue: "", numberValue: 0, boolValue: false },
  style: { spacing: 20 },
});
customNode.ui.append([
  customNode.createHozLayout([
    customNode.createLabel("String", { style: { grow: 0.4 } }),
    customNode.createLabel(customNode.state.stringValue,
      // Two-way binding works for any UI component, by passing the propName property
      // In this example, this Label UI component is bound to 'stringValue' prop of customNode's state
      { propName: "stringValue", input: true, output: true, style: { grow: 0.6 } }
    ),
  ], { style: { spacing: 10 } }),
  customNode.createHozLayout([
    customNode.createLabel("Number", { style: { grow: 0.4 } }),
    customNode.createInput({
      value: customNode.state.numberValue, propName: "numberValue", input: true, output: true,
      height: 20, style: { type: InputType.Number, grow: 0.6 },
    }),
  ], { style: { spacing: 10 } }),
  customNode.createHozLayout([
    customNode.createLabel("Boolean", { style: { grow: 0.4 } }),
    customNode.createToggle({
      propName: "boolValue", input: true, output: true,
      height: 10, style: { grow: 0.2 },
    }),
  ], { style: { spacing: 10 } }),
]);
// Watchers can be registered for a state prop
customNode.watch("stringValue", (oldVal, newVal) =>
  console.log("Watcher for prop 'stringValue': Old:", oldVal, "New:", newVal)
);
customNode.watch("numberValue", (oldVal, newVal) =>
  console.log("Watcher for prop 'numberValue': Old:", oldVal, "New:", newVal)
);
customNode.watch("boolValue", (oldVal, newVal) =>
  console.log("Watcher for prop 'boolValue': Old:", oldVal, "New:", newVal)
);

stringSource.outputsUI[0].connect(customNode.inputsUI[0]);
numberSource.outputsUI[1].connect(customNode.inputsUI[1]);
booleanSource.outputsUI[0].connect(customNode.inputsUI[2]);
customNode.outputsUI[0].connect(log.inputs[1]);
customNode.outputsUI[1].connect(log.inputs[2]);
customNode.outputsUI[2].connect(log.inputs[3]);

flowConnect.render(flow);
