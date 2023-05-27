const flow = flowConnect.createFlow({
  name: "Sample Flow",
  rules: {
    r: ["r", "g", "b"],
    g: ["r", "g", "b"],
    b: ["r", "g", "b"],
    image: ["image"],
  },
  ruleColors: {
    r: "#ff0000",
    g: "#00ff00",
    b: "#0000ff",
    image: "grey",
  },
});

const node = flow.createNode("core/empty", Vector.create(50, 50), {
  name: "Test Node",
  width: 250,
  inputs: [
    { name: "R", dataType: "r" },
    { name: "G", dataType: "g" },
    { name: "B", dataType: "b" },
  ],
  outputs: [{ name: "Image", dataType: "image" }],
  state: { labelText: "Label Text", sliderValue: 50, toggle: false, selectedValue: null, file: null, inputValue: 365 },
  style: { padding: 10, spacing: 10, rowHeight: 10 },
});
node.ui.append([
  node.createUI("core/label", {
    propName: "labelText",
    input: true,
    output: true,
    style: { align: Align.Center, fontSize: "17px" },
  }),
  node.createUI("core/image", { style: { align: Align.Center } }),
  node.createUI("core/x-layout", {
    childs: [
      node.createUI("core/label", { text: "", propName: "sliderValue", style: { grow: 0.2, precision: 2 } }),
      node.createUI("core/slider", {
        min: 0,
        max: 150,
        propName: "sliderValue",
        input: true,
        output: true,
        height: 15,
        style: { grow: 0.8, railHeight: 5 },
      }),
    ],
  }),
  node.createUI("core/button", { text: "Click Me !", input: true, output: true }),
  node.createUI("core/x-layout", {
    childs: [
      node.createUI("core/label", { text: "Toggle: ", style: { grow: 0.8 } }),
      node.createUI("core/toggle", { propName: "toggle", input: true, output: true, style: { grow: 0.2 } }),
    ],
  }),
  node.createUI("core/x-layout", {
    childs: [
      node.createUI("core/label", { text: "Select: ", style: { grow: 0.3 } }),
      node.createUI("core/select", {
        values: ["ABC", "DEF", "GHI", "JKL", "MNO"],
        propName: "selectedValue",
        input: true,
        output: true,
        height: 20,
        style: { grow: 0.7 },
      }),
    ],
  }),
  node.createUI("core/x-layout", {
    childs: [
      node.createUI("core/label", { text: "Source: ", style: { grow: 0.5 } }),
      node.createUI("core/source", { propName: "file", input: true, output: true, height: 20, style: { grow: 0.5 } }),
    ],
  }),
  node.createUI("core/x-layout", {
    childs: [
      node.createUI("core/label", { text: "Input: ", style: { grow: 0.4 } }),
      node.createUI("core/input", {
        propName: "inputValue",
        input: true,
        output: true,
        height: 20,
        style: { type: InputType.Number, grow: 0.6, align: Align.Right },
      }),
    ],
  }),
]);

const numberNode = flow.createNode("core/empty", Vector.create(50, 50), {
  name: "Number Source",
  width: 140,
  state: { value: 15 },
  style: { padding: 10, spacing: 10, rowHeight: 10 },
});
numberNode.ui.append(
  numberNode.createUI("core/input", {
    propName: "value",
    input: true,
    output: true,
    height: 20,
    style: { type: InputType.Number, grow: 0.6, align: Align.Right },
  })
);

const textNode = flow.createNode("core/empty", Vector.create(50, 120), {
  name: "Text Source",
  width: 140,
  state: { value: "Example Text" },
  style: { padding: 10, spacing: 10, rowHeight: 10 },
});
textNode.ui.append(
  textNode.createUI("core/input", {
    propName: "value",
    input: true,
    output: true,
    height: 20,
    style: { type: InputType.Text, grow: 0.6, align: Align.Right },
  })
);

const toggleNode = flow.createNode("core/empty", Vector.create(50, 190), {
  name: "Toggle Source",
  width: 140,
  state: { value: true },
  style: { padding: 10, spacing: 10, rowHeight: 10 },
});
toggleNode.ui.append(
  toggleNode.createUI("core/toggle", { propName: "value", input: true, output: true, style: { grow: 0.2 } })
);

node.on("process", () => console.log("Test Node"));
numberNode.on("process", () => console.log("Number Source"));
textNode.on("process", () => console.log("Text Source"));
toggleNode.on("process", () => console.log("Toggle Source"));

const flow2 = flowConnect.createFlow({ name: "Test Flow 2" });
flow2.addInput("Input 1", "number", Vector.create(100, 100));
flow2.addOutput("Output 1", "string", Vector.create(200, 200));
const convertNode = flow2.createNode("core/empty", Vector.create(50, 50), {
  name: "Converter",
  width: 130,
  inputs: [{ name: "Number", dataType: "number" }],
  outputs: [{ name: "Text", dataType: "string" }],
});
convertNode.on("process", (inst, inputs) => {
  console.log("Convert Node");
  inst.setOutputs("Text", inputs[0] ? inputs[0].toString() : "Error");
});
const subFlowNode = flow.addSubFlow(flow2, Vector.create(200, 200));
