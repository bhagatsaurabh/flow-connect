let flow = flowConnect.createFlow({ name: 'StandardNodes Test' });

let log = StandardNodes.Common.Log(flow);
let timer = StandardNodes.Common.Timer(flow, { props: { delay: 70 } });
// let random = StandardNodes.Common.Random(flow);
let buffer = StandardNodes.Common.Buffer(flow, { props: { size: 300 } });
// let arraySource = StandardNodes.Common.ArraySource(flow, { props: { number: true } });
// let arrayIndex = StandardNodes.Common.ArrayIndex(flow, {});
// let boolean = StandardNodes.Common.BooleanSource(flow);
// let json = StandardNodes.Common.JsonSource(flow);
// let compare = StandardNodes.Common.Compare(flow, { props: { value: '<' } });
// let number1 = StandardNodes.Common.NumberSource(flow, { props: { fractional: true, value: 0.042 } });
// let string1 = StandardNodes.Common.StringSource(flow, { props: { value: 'Saurabh Bhagat' } });
// let number2 = StandardNodes.Common.NumberSource(flow, { props: { fractional: true, value: 0.042 } });
// let string2 = StandardNodes.Common.StringSource(flow, { props: { value: 'Saurabh Bhagat' } });
// let file = StandardNodes.Common.FileSource(flow);
// let property = StandardNodes.Common.Property(flow);

// let timer1 = StandardNodes.Common.Timer(flow, { props: { delay: 500 } });
// let timer2 = StandardNodes.Common.Timer(flow, { props: { delay: 1000 } });
// let timer3 = StandardNodes.Common.Timer(flow, { props: { delay: 1500 } });
// let timer4 = StandardNodes.Common.Timer(flow, { props: { delay: 2000 } });
// let sync = StandardNodes.Common.Sync(flow, {}, 4);
let toVector2 = StandardNodes.Common.ToVector2(flow);
let numberRange = StandardNodes.Common.NumberRange(flow, { props: { value: -5 * Constant.PI, min: -5 * Constant.PI, max: 5 * Constant.PI, step: 0.1 } });

// let delay = StandardNodes.Common.Delay(flow);

// let abs = StandardNodes.Math.Abs(flow);
// let average = StandardNodes.Math.Average(flow);
// let clamp = StandardNodes.Math.Clamp(flow);
let func = StandardNodes.Math.Function(flow, {}, 1, 2);

timer.outputs[0].connect(numberRange.inputs[0]);
numberRange.outputs[0].connect(func.inputs[0]);
func.outputs[0].connect(toVector2.inputs[0]);
func.outputs[1].connect(toVector2.inputs[1]);
toVector2.outputs[0].connect(buffer.inputs[0]);
buffer.outputs[0].connect(log.inputs[1]);