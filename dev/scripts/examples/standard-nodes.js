let flow = flowConnect.createFlow({ name: 'StandardNodes Test' });

let log = new StandardNodes.Common.Log(flow);
// let timer = new StandardNodes.Common.Timer(flow, { state: { delay:0 } });
// let random1 = new StandardNodes.Common.Random(flow);
// let random2 = new StandardNodes.Common.Random(flow);
// let random3 = new StandardNodes.Common.Random(flow);
// let random4 = new StandardNodes.Common.Random(flow);
// let buffer = new StandardNodes.Common.Buffer(flow, { state: { size: 300 } });
// let arraySource = new StandardNodes.Common.ArraySource(flow, { state: { number: true } });
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
// let toVector2 = new StandardNodes.Common.ToVector2(flow);
// let numberRange = new StandardNodes.Common.NumberRange(flow, { state: { value: -5 * Constant.PI, min: -5 * Constant.PI, max: 5 * Constant.PI, step: 0.1 } });

// let delay = new StandardNodes.Common.Delay(flow);

// let abs = new StandardNodes.Math.Abs(flow);
// let average = new StandardNodes.Math.Average(flow);
// let clamp = new StandardNodes.Math.Clamp(flow);
// let func = new StandardNodes.Math.Function(flow, {}, ['cos(t)', 'sin(t) + 0.2cos(2.8t)']);
// let parametricPlotter = new StandardNodes.Visual.ParametricPlotter(flow, {}, 250);
// let gEventEmitter = new StandardNodes.Common.GlobalEvent(flow, GlobalEventType.Emitter, 'reset', {});
// let gEventReceiver = new StandardNodes.Common.GlobalEvent(flow, GlobalEventType.Receiver, 'reset', {});

// let syncData = new StandardNodes.Common.SyncData(flow, { state: { syncType: 'partial' } }, 3);
