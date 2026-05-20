class TestNode extends FC.Node {
  setupIO() {
    this.addTerminals([
      { type: FC.TerminalType.IN, name: "R", dataType: "r" },
      { type: FC.TerminalType.IN, name: "G", dataType: "g" },
      { type: FC.TerminalType.IN, name: "B", dataType: "b" },
      { type: FC.TerminalType.OUT, name: "Image", dataType: "image" },
    ]);
  }
  created(options) {
    this.state = {
      labelText: "Label Text",
      sliderValue: 50,
      toggle: false,
      selectedValue: null,
      file: null,
      inputValue: 365,
      ...options.state,
    };

    this.ui.append([
      this.createUI("core/label", {
        propName: "labelText",
        input: true,
        output: true,
        style: { align: FC.Align.Center, fontSize: "17px" },
      }),
      this.createUI("core/image", { style: { align: FC.Align.Center } }),
      this.createUI("core/x-layout", {
        childs: [
          this.createUI("core/label", { text: "", propName: "sliderValue", style: { grow: 0.2, precision: 2 } }),
          this.createUI("core/slider", {
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
      this.createUI("core/button", { text: "Click Me !", input: true, output: true }),
      this.createUI("core/x-layout", {
        childs: [
          this.createUI("core/label", { text: "Toggle: ", style: { grow: 0.8 } }),
          this.createUI("core/toggle", { propName: "toggle", input: true, output: true, style: { grow: 0.2 } }),
        ],
      }),
      this.createUI("core/x-layout", {
        childs: [
          this.createUI("core/label", { text: "Select: ", style: { grow: 0.3 } }),
          this.createUI("core/select", {
            values: ["ABC", "DEF", "GHI", "JKL", "MNO"],
            propName: "selectedValue",
            input: true,
            output: true,
            height: 20,
            style: { grow: 0.7 },
          }),
        ],
      }),
      this.createUI("core/x-layout", {
        childs: [
          this.createUI("core/label", { text: "Source: ", style: { grow: 0.5 } }),
          this.createUI("core/source", {
            propName: "file",
            input: true,
            output: true,
            height: 20,
            style: { grow: 0.5 },
          }),
        ],
      }),
      this.createUI("core/x-layout", {
        childs: [
          this.createUI("core/label", { text: "Input: ", style: { grow: 0.4 } }),
          this.createUI("core/input", {
            propName: "inputValue",
            input: true,
            output: true,
            height: 20,
            style: { type: FC.InputType.Number, grow: 0.6, align: FC.Align.Right },
          }),
        ],
      }),
    ]);
  }
  process() {}
}
class NumberNode extends FC.Node {
  setupIO() {}
  created(options) {
    this.state = { value: 0, ...options.state };

    this.ui.append(
      this.createUI("core/input", {
        propName: "value",
        input: true,
        output: true,
        height: 20,
        style: { type: FC.InputType.Number, grow: 0.6, align: FC.Align.Right },
      }),
    );
  }
  process() {}
}
class TextNode extends FC.Node {
  setupIO() {}
  created(options) {
    this.state = { value: "", ...options.state };

    this.ui.append(
      this.createUI("core/input", {
        propName: "value",
        input: true,
        output: true,
        height: 20,
        style: { type: FC.InputType.Text, grow: 0.6, align: FC.Align.Right },
      }),
    );
  }
  process() {}
}
class ToggleNode extends FC.Node {
  setupIO() {}
  created(options) {
    this.state = { value: false, ...options.state };

    this.ui.append(
      this.createUI("core/toggle", { propName: "value", input: true, output: true, style: { grow: 0.2 } }),
    );
  }
  process() {}
}
class ConvertNode extends FC.Node {
  setupIO() {
    this.addTerminals([
      { type: FC.TerminalType.IN, name: "Number", dataType: "number" },
      { type: FC.TerminalType.OUT, name: "Text", dataType: "string" },
    ]);
  }
  created() {}
  process(inputs) {
    this.setOutputs("Text", inputs[0] ? inputs[0].toString() : "Error");
  }
}

FC.FlowConnect.register({ type: "node", name: "test/test-node" }, TestNode);
FC.FlowConnect.register({ type: "node", name: "test/number-node" }, NumberNode);
FC.FlowConnect.register({ type: "node", name: "test/text-node" }, TextNode);
FC.FlowConnect.register({ type: "node", name: "test/toggle-node" }, ToggleNode);
FC.FlowConnect.register({ type: "node", name: "test/convert-node" }, ConvertNode);

let flow = flowConnect.createFlow({
  name: "Sample Flow",
  rules: {
    r: ["r", "g", "b"],
    g: ["r", "g", "b"],
    b: ["r", "g", "b"],
    image: ["image"],
  },
  ruleColors: {
    r: FC.Color.create("#ff0000"),
    g: FC.Color.create("#00ff00"),
    b: FC.Color.create("#0000ff"),
    image: FC.Color.create("#000000"),
  },
});

const node = flow.createNode("test/test-node", FC.Vector.create(300, 50), {
  name: "Test Node",
  width: 250,
  style: { padding: 10, spacing: 10, rowHeight: 10 },
  state: {
    labelText: "Label Text",
    sliderValue: 50,
    toggle: false,
    selectedValue: null,
    file: null,
    inputValue: 365,
  },
});
const numberNode = flow.createNode("test/number-node", FC.Vector.create(50, 50), {
  name: "Number Source",
  width: 140,
  state: { value: 15 },
  style: { padding: 10, spacing: 10, rowHeight: 10 },
});
const textNode = flow.createNode("test/text-node", FC.Vector.create(50, 120), {
  name: "Text Source",
  width: 140,
  state: { value: "Example Text" },
  style: { padding: 10, spacing: 10, rowHeight: 10 },
});
const toggleNode = flow.createNode("test/toggle-node", FC.Vector.create(50, 190), {
  name: "Toggle Source",
  width: 140,
  state: { value: true },
  style: { padding: 10, spacing: 10, rowHeight: 10 },
});

const flow2 = flowConnect.createFlow({ name: "Test Flow 2" });
flow2.addInput("Input 1", "number", FC.Vector.create(100, 100));
flow2.addOutput("Output 1", "string", FC.Vector.create(200, 200));
const convertNode = flow2.createNode("test/convert-node", FC.Vector.create(50, 50), {
  name: "Converter",
  width: 130,
});
const subFlowNode = flow.addSubFlow(flow2, FC.Vector.create(50, 300));

convertNode.on("process", () => console.log("Convert Node"));
node.on("process", () => console.log("Test Node"));
numberNode.on("process", () => console.log("Number Source"));
textNode.on("process", () => console.log("Text Source"));
toggleNode.on("process", () => console.log("Toggle Source"));
