class DataExtractNode extends Node {
  setupIO() {
    this.addTerminals([
      { type: TerminalType.IN, name: "data", dataType: "any" },
      { type: TerminalType.OUT, name: "BTC", dataType: "number" },
      { type: TerminalType.OUT, name: "ETH", dataType: "number" },
      { type: TerminalType.OUT, name: "LTC", dataType: "number" },
    ]);
  }
  created() {
    this.name = "Data Extract";
    this.width = 100;
  }
  process(inputs) {
    if (!inputs[0]) return;
    this.setOutputs({
      BTC: inputs[0].crypto["X:BTCUSD"].lastTrade.p,
      ETH: inputs[0].crypto["X:ETHUSD"].lastTrade.p,
      LTC: inputs[0].crypto["X:LTCUSD"].lastTrade.p,
    });
  }
}
FlowConnect.register({ type: "node", name: "custom/data-extract" }, DataExtractNode);

let flow = flowConnect.createFlow({
  name: "Stock Flow",
  rules: {},
  ruleColors: {
    number: Color.create("#7aff66"),
    string: Color.create("#ffe366"),
    array: Color.create("#66e6ff"),
    any: Color.create("#6675ff"),
    event: Color.create("#ffb066"),
  },
});

const timer = flow.createNode("common/timer", Vector.create(50, 50), { state: { delay: 1000 } });
const api = flow.createNode("net/api", Vector.create(100, 100), {
  state: { src: "/test-api" },
});
// const log = flow.createNode("common/log", Vector.create(150, 150), {});
const extract = flow.createNode("custom/data-extract", Vector.create(200, 200), {});

const btcBuffer = flow.createNode("common/buffer", Vector.create(200, 200), { state: { size: 30 } });
const ethBuffer = flow.createNode("common/buffer", Vector.create(200, 200), { state: { size: 30 } });
const ltcBuffer = flow.createNode("common/buffer", Vector.create(200, 200), { state: { size: 30 } });
const btcNormalize = flow.createNode("math/normalize", Vector.create(200, 200), {
  normalizationType: "array",
  state: { relative: true, constant: 5 },
});
const ethNormalize = flow.createNode("math/normalize", Vector.create(200, 200), {
  normalizationType: "array",
  state: { relative: true, constant: 5 },
});
const ltcNormalize = flow.createNode("math/normalize", Vector.create(200, 200), {
  normalizationType: "array",
  state: { relative: true, constant: 5 },
});
const btcEthToArray = flow.createNode("common/to-array", Vector.create(200, 200), { noOfInputs: 2 });
const btcLtcToArray = flow.createNode("common/to-array", Vector.create(200, 200), { noOfInputs: 2 });
const btcEthLtcToArray = flow.createNode("common/to-array", Vector.create(200, 200), { noOfInputs: 3 });

const btcEthChart = flow.createNode("visual/line-chart-mini", Vector.create(200, 200), {
  displayHeight: 100,
  name: "BTC : ETH",
  width: 250,
  state: { colors: ["#ff6666", "#66d4ff"] },
  style: { backgroundColor: "#7a7a7a" },
});
const btcLtcChart = flow.createNode("visual/line-chart-mini", Vector.create(200, 200), {
  displayHeight: 100,
  state: { colors: ["#ffb066", "#668fff"] },
  style: { backgroundColor: "#7a7a7a" },
  name: "BTC : LTC",
  width: 250,
});
const btcEthLtcChart = flow.createNode("visual/line-chart-mini", Vector.create(200, 200), {
  displayHeight: 100,
  style: { backgroundColor: "#7a7a7a" },
  state: { colors: ["#ff66ad", "#669eff", "#66ffe3"] },
  name: "BTC : ETH : LTC",
  width: 250,
});

timer.outputs[0].connect(api.inputs[0]);
api.outputs[1].connect(extract.inputs[0]);
extract.outputs[0].connect(btcBuffer.inputs[0]);
extract.outputs[1].connect(ethBuffer.inputs[0]);
extract.outputs[2].connect(ltcBuffer.inputs[0]);
// log.ui.query('button')[1].call('click');
// log.ui.children[0].children[1].call("click");
// log.ui.children[0].children[1].call("click");
btcBuffer.outputs[0].connect(btcNormalize.inputs[0]);
ethBuffer.outputs[0].connect(ethNormalize.inputs[0]);
ltcBuffer.outputs[0].connect(ltcNormalize.inputs[0]);
btcNormalize.outputs[0].connect(btcEthToArray.inputs[0]);
ethNormalize.outputs[0].connect(btcEthToArray.inputs[1]);
// btcEthToArray.outputs[0].connect(log.inputs[1]);
btcNormalize.outputs[0].connect(btcLtcToArray.inputs[0]);
ltcNormalize.outputs[0].connect(btcLtcToArray.inputs[1]);
// btcLtcToArray.outputs[0].connect(log.inputs[2]);
btcNormalize.outputs[0].connect(btcEthLtcToArray.inputs[0]);
ethNormalize.outputs[0].connect(btcEthLtcToArray.inputs[1]);
ltcNormalize.outputs[0].connect(btcEthLtcToArray.inputs[2]);
// btcEthLtcToArray.outputs[0].connect(log.inputs[3]);

btcBuffer.outputsUI[0].connect(btcEthChart.inputsUI[1]);
btcBuffer.outputsUI[0].connect(btcLtcChart.inputsUI[1]);
btcBuffer.outputsUI[0].connect(btcEthLtcChart.inputsUI[1]);

btcEthToArray.outputs[0].connect(btcEthChart.inputs[0]);
btcLtcToArray.outputs[0].connect(btcLtcChart.inputs[0]);
btcEthLtcToArray.outputs[0].connect(btcEthLtcChart.inputs[0]);
