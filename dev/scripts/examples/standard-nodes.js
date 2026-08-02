const FC = __FC__;

flowConnect.setDefaultStyle("ui", "core/label", { color: "#fff" });
flowConnect.setDefaultStyle("ui", "core/input", { color: "#fff", border: "#fff" });
flowConnect.setDefaultStyle("ui", "core/toggle", { color: "#fff", backgroundColor: "#777" });
flowConnect.setDefaultStyle("node", { color: "#fff" });
flowConnect.setDefaultStyle("connector", { width: 2, border: false, color: "#000" });
flowConnect.registerRenderer("background", () => {
  return (context, params, _) => {
    context.fillStyle = "#292929";
    context.shadowColor = "#000";
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 15;
    context.fillRect(params.position.x, params.position.y, params.width, params.height);
  };
});

let flow = flowConnect.createFlow({ name: "FC.StandardNodes Test", rules: {} });

let log = new FC.StandardNodes.Common.Log(flow);
let timer = new FC.StandardNodes.Common.Timer(flow, { state: { delay: 500 } });
let random1 = new FC.StandardNodes.Common.Random(flow);
let random2 = new FC.StandardNodes.Common.Random(flow);
let random3 = new FC.StandardNodes.Common.Random(flow);
let random4 = new FC.StandardNodes.Common.Random(flow);
let buffer = new FC.StandardNodes.Common.Buffer(flow, { state: { size: 300 } });
const arraySource = flow.createNode("common/array-source", FC.Vector.create(50, 50), {
  state: { number: true, range: true, min: -5 * Math.PI, max: 5 * Math.PI, step: 0.1 },
});
let arrayIndex = new FC.StandardNodes.Common.ArrayIndex(flow, {});
let boolean = new FC.StandardNodes.Common.BooleanSource(flow);
let json = new FC.StandardNodes.Common.JsonSource(flow);
let compare = new FC.StandardNodes.Common.Compare(flow, { state: { value: "<" } });
let number1 = new FC.StandardNodes.Common.NumberSource(flow, { state: { fractional: true, value: 0.042 } });
let string1 = new FC.StandardNodes.Common.StringSource(flow, { state: { value: "Saurabh Bhagat" } });
let number2 = new FC.StandardNodes.Common.NumberSource(flow, { state: { fractional: true, value: 0.042 } });
let string2 = new FC.StandardNodes.Common.StringSource(flow, { state: { value: "Saurabh Bhagat" } });
let file = new FC.StandardNodes.Common.FileSource(flow);
let property = new FC.StandardNodes.Common.Property(flow);

let timer1 = new FC.StandardNodes.Common.Timer(flow, { state: { delay: 500 } });
let timer2 = new FC.StandardNodes.Common.Timer(flow, { state: { delay: 1000 } });
let timer3 = new FC.StandardNodes.Common.Timer(flow, { state: { delay: 1500 } });
let timer4 = new FC.StandardNodes.Common.Timer(flow, { state: { delay: 2000 } });
let sync = new FC.StandardNodes.Common.SyncEvent(flow, {}, 4);
const toVector = flow.createNode("common/to-vector", FC.Vector.create(50, 50), {});
let toArray = new FC.StandardNodes.Common.ToArray(flow, 3);
const numberRange = flow.createNode("common/number-range", FC.Vector.create(150, 150), {
  state: { value: -5 * Math.PI, min: -5 * Math.PI, max: 5 * Math.PI, step: 0.1 },
});

let delay = new FC.StandardNodes.Common.Delay(flow);

let abs = new FC.StandardNodes.Math.Abs(flow);
let average = new FC.StandardNodes.Math.Average(flow);
let ceil = new FC.StandardNodes.Math.Ceil(flow);
let floor = new FC.StandardNodes.Math.Floor(flow);
let clamp = new FC.StandardNodes.Math.Clamp(flow);
const func1 = flow.createNode("math/func", FC.Vector.create(100, 100), { expression: "sin(t) + 0.2cos(2.8t)" });
const func2 = flow.createNode("math/func", FC.Vector.create(100, 100), { expression: "cos(t)" });
const parametricPlotter = flow.createNode("visual/function-plotter", FC.Vector.create(50, 50), { displayHeight: 250 });
let gEventEmitter = new FC.StandardNodes.Common.GlobalEvent(flow, FC.GlobalEventType.Emitter, "reset", {});
let gEventReceiver = new FC.StandardNodes.Common.GlobalEvent(flow, FC.GlobalEventType.Receiver, "reset", {});

let syncData = new FC.StandardNodes.Common.SyncData(flow, { state: { syncType: "partial" } }, 3);
