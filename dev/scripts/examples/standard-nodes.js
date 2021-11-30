let flow = flowConnect.createFlow({ name: 'StandardNodes Test' });

let log = StandardNodes.Log(flow);
// let random = StandardNodes.Random(flow);
// let timer = StandardNodes.Timer(flow);
// let arraySource = StandardNodes.ArraySource(flow, { props: { number: true } });
// let arrayIndex = StandardNodes.ArrayIndex(flow, {});
// let boolean = StandardNodes.BooleanSource(flow);
// let json = StandardNodes.JsonSource(flow);
let compare = StandardNodes.Compare(flow, { props: { value: '<' } });
let number1 = StandardNodes.NumberSource(flow, { props: { fractional: true, value: 0.042 } });
let string1 = StandardNodes.StringSource(flow, { props: { value: 'Saurabh Bhagat' } });
let number2 = StandardNodes.NumberSource(flow, { props: { fractional: true, value: 0.042 } });
let string2 = StandardNodes.StringSource(flow, { props: { value: 'Saurabh Bhagat' } });