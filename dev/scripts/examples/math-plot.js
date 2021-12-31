let flow = flowConnect.createFlow({ name: 'Math Plot' });

let log = StandardNodes.Common.Log(flow);
// let timer = StandardNodes.Common.Timer(flow, { props: { delay: 0 } });
let toVector2 = StandardNodes.Common.ToVector2(flow);
// let numberRange = StandardNodes.Common.NumberRange(flow, { props: { value: -5 * Math.PI, min: -5 * Math.PI, max: 5 * Math.PI, step: 0.1 } });
let func1 = StandardNodes.Math.Function(flow, {}, 'cos(t)');
let func2 = StandardNodes.Math.Function(flow, {}, 'sin(t) + 0.2cos(2.8t)');
let parametricPlotter = StandardNodes.Visual.FunctionPlotter(flow, 250);
// let gEventEmitter = StandardNodes.Common.GlobalEvent(flow, GlobalEventType.Emitter, 'reset', {});
// let gEventReceiver = StandardNodes.Common.GlobalEvent(flow, GlobalEventType.Receiver, 'reset', {});
let arraySource = StandardNodes.Common.ArraySource(flow, { props: { number: true, range: true, min: -5 * Math.PI, max: 5 * Math.PI, step: 0.1 } });

// timer.outputs[0].connect(numberRange.inputs[0]);
// numberRange.outputs[0].connect(func.inputs[0]);
arraySource.outputs[0].connect(func1.inputs[0]);
arraySource.outputs[0].connect(func2.inputs[0]);
func1.outputs[0].connect(toVector2.inputs[0]);
func2.outputs[0].connect(toVector2.inputs[1]);
toVector2.outputs[0].connect(parametricPlotter.inputs[0]);
// func.outputs[0].connect(gEventEmitter.inputs[0]);
// func.outputs[0].connect(parametricPlotter.inputsUI[0]);
// gEventReceiver.outputs[0].connect(numberRange.inputs[1]);
