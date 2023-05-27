let flow = flowConnect.createFlow({ name: 'Math Plot' });

let log = new StandardNodes.Common.Log(flow);
// let timer = new StandardNodes.Common.Timer(flow, { state: { delay: 0 } });
let tovector = new StandardNodes.Common.ToVector(flow);
// let numberRange = new StandardNodes.Common.NumberRange(flow, { state: { value: -5 * Math.PI, min: -5 * Math.PI, max: 5 * Math.PI, step: 0.1 } });
let func1 = new StandardNodes.Math.Func(flow, {}, 'cos(t)');
let func2 = new StandardNodes.Math.Func(flow, {}, 'sin(t) + 0.2cos(2.8t)');
let parametricPlotter = new StandardNodes.Visual.FunctionPlotter(flow, 250);
// let gEventEmitter = new StandardNodes.Common.GlobalEvent(flow, GlobalEventType.Emitter, 'reset', {});
// let gEventReceiver = new StandardNodes.Common.GlobalEvent(flow, GlobalEventType.Receiver, 'reset', {});
let arraySource = new StandardNodes.Common.ArraySource(flow, { state: { number: true, range: true, min: -5 * Math.PI, max: 5 * Math.PI, step: 0.1 } });

// timer.outputs[0].connect(numberRange.inputs[0]);
// numberRange.outputs[0].connect(func.inputs[0]);
arraySource.outputs[0].connect(func1.inputs[0]);
arraySource.outputs[0].connect(func2.inputs[0]);
func1.outputs[0].connect(tovector.inputs[0]);
func2.outputs[0].connect(tovector.inputs[1]);
tovector.outputs[0].connect(parametricPlotter.inputs[0]);
// func.outputs[0].connect(gEventEmitter.inputs[0]);
// func.outputs[0].connect(parametricPlotter.inputsUI[0]);
// gEventReceiver.outputs[0].connect(numberRange.inputs[1]);
