let flow = flowConnect.createFlow({ name: "StandardNodes Test", rules: {} });

// let log = new StandardNodes.Common.Log(flow);
// let timer = new StandardNodes.Common.Timer(flow, { state: { delay: 500 } });
// let random1 = new StandardNodes.Common.Random(flow);
// let random2 = new StandardNodes.Common.Random(flow);
// let random3 = new StandardNodes.Common.Random(flow);
// let random4 = new StandardNodes.Common.Random(flow);
// let buffer = new StandardNodes.Common.Buffer(flow, { state: { size: 300 } });
const arraySource = flow.createNode("common/array-source", Vector.create(50, 50), {
  state: { number: true, range: true, min: -5 * Math.PI, max: 5 * Math.PI, step: 0.1 },
});
// let arrayIndex = new StandardNodes.Common.ArrayIndex(flow, {});
// let boolean = new StandardNodes.Common.BooleanSource(flow);
// let json = new StandardNodes.Common.JsonSource(flow);
// let compare = new StandardNodes.Common.Compare(flow, { state: { value: '<' } });
// let number1 = new StandardNodes.Common.NumberSource(flow, { state: { fractional: true, value: 0.042 } });
// let string1 = new StandardNodes.Common.StringSource(flow, { state: { value: 'Saurabh Bhagat' } });
// let number2 = new StandardNodes.Common.NumberSource(flow, { state: { fractional: true, value: 0.042 } });
// let string2 = new StandardNodes.Common.StringSource(flow, { state: { value: 'Saurabh Bhagat' } });
// let file = new StandardNodes.Common.FileSource(flow);
// let property = new StandardNodes.Common.Property(flow);

// let timer1 = new StandardNodes.Common.Timer(flow, { state: { delay: 500 } });
// let timer2 = new StandardNodes.Common.Timer(flow, { state: { delay: 1000 } });
// let timer3 = new StandardNodes.Common.Timer(flow, { state: { delay: 1500 } });
// let timer4 = new StandardNodes.Common.Timer(flow, { state: { delay: 2000 } });
// let sync = new StandardNodes.Common.SyncEvent(flow, {}, 4);
const toVector = flow.createNode("common/to-vector", Vector.create(50, 50), {});
// let toArray = new StandardNodes.Common.ToArray(flow, 3);
// const numberRange = flow.createNode("common/number-range", Vector.create(150, 150), {
//   state: { value: -5 * Math.PI, min: -5 * Math.PI, max: 5 * Math.PI, step: 0.1 },
// });

// let delay = new StandardNodes.Common.Delay(flow);

// let abs = new StandardNodes.Math.Abs(flow);
// let average = new StandardNodes.Math.Average(flow);
// let ceil = new StandardNodes.Math.Ceil(flow);
// let floor = new StandardNodes.Math.Floor(flow);
// let clamp = new StandardNodes.Math.Clamp(flow);
const func1 = flow.createNode("math/func", Vector.create(100, 100), { expression: "sin(t) + 0.2cos(2.8t)" });
const func2 = flow.createNode("math/func", Vector.create(100, 100), { expression: "cos(t)" });
const parametricPlotter = flow.createNode("visual/function-plotter", Vector.create(50, 50), { displayHeight: 250 });
// let gEventEmitter = new StandardNodes.Common.GlobalEvent(flow, GlobalEventType.Emitter, 'reset', {});
// let gEventReceiver = new StandardNodes.Common.GlobalEvent(flow, GlobalEventType.Receiver, 'reset', {});

// let syncData = new StandardNodes.Common.SyncData(flow, { state: { syncType: 'partial' } }, 3);
