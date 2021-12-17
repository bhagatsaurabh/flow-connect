let flow = flowConnect.createFlow({ name: 'Audio Test', rules: {}, terminalTypeColors: {} });

// let log = StandardNodes.Common.Log(flow);

let audioSource = StandardNodes.Audio.Source(flow);
let destination = StandardNodes.Audio.Destination(flow);
let automate = StandardNodes.Audio.Automate(flow, { props: { min: -2400, max: 2400, value: 0 } });

let gain = StandardNodes.UI.Dial(flow, { props: { min: 0, max: 2, value: 0.5 } });
let detune = StandardNodes.UI.Dial(flow, { props: { min: -2400, max: 2400, value: 0 } });
let playRate = StandardNodes.UI.Dial(flow, { props: { min: 0.25, max: 3, value: 1 } });

audioSource.outputs[0].connect(destination.inputs[0]);
gain.outputsUI[0].connect(audioSource.inputs[1]);
detune.outputsUI[0].connect(audioSource.inputs[2]);
playRate.outputsUI[0].connect(audioSource.inputs[3]);
