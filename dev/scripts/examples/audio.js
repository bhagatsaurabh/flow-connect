let flow = flowConnect.createFlow({
  name: "Audio Test",
  rules: {},
});

// const log = flow.createNode("common/log", Vector.create(50, 50), { width: 180 });
const timer = flow.createNode("common/timer", Vector.create(100, 100), {});
// const arrayIndex = flow.createNode("common/array-index", Vector.create(50, 50), {});
// const arraySource = flow.createNode("common/array-source", Vector.create(100, 100), {});
// const numberSource1 = flow.createNode("common/number-source", Vector.create(150, 150), {});
// const numberSource2 = flow.createNode("common/number-source", Vector.create(150, 150), {});
// const boolSource = flow.createNode("common/boolean-source", Vector.create(50, 50), {});
// const buffer = flow.createNode("common/buffer", Vector.create(100, 100), {});
// const compare = flow.createNode("common/compare", Vector.create(150, 150), {});
const random = flow.createNode("common/random", Vector.create(150, 150), {});
// const delay = flow.createNode("common/delay", Vector.create(150, 150), {});
// const fileSource = flow.createNode("common/file-source", Vector.create(150, 150), {});

// const audioSource = flow.createNode("audio/source", Vector.create(50, 50), { width: 200 });
// const destination = flow.createNode("audio/destination", Vector.create(200, 50), { width: 150 });

// audioSource.outputs[0].connect(destination.inputs[0]);

// const automate = flow.createNode("audio/automate", Vector.create(100, 200), {
//   state: { min: 20, max: 800, value: 20 },
// });
// const splitter = flow.createNode("audio/channel-splitter", Vector.create(100, 200), {});
// const merger = flow.createNode("audio/channel-merger", Vector.create(100, 200), {});
// let debug = new StandardNodes.Audio.Debug(flow);
// const adsr = flow.createNode("audio/adsr", Vector.create(100, 200), {});
// const gainNode = flow.createNode("audio/gain", Vector.create(100, 200), {});
// const metronome = flow.createNode("audio/metronome", Vector.create(100, 200), {});
// const moogEffect = flow.createNode("audio/moog", Vector.create(100, 200), {});
// const bitcrusherEffect = flow.createNode("audio/bitcrusher", Vector.create(100, 200), {});
// const biquadFilter = flow.createNode("audio/biquad", Vector.create(100, 200), {});
// const delayEffect = flow.createNode("audio/delay", Vector.create(100, 200), {});
// const dynamicsCompressor = flow.createNode("audio/dynamics-compressor", Vector.create(100, 200), {});
// const chorusEffect = flow.createNode("audio/chorus", Vector.create(100, 200), {});
// const overdriveEffect = flow.createNode("audio/overdrive", Vector.create(100, 200), {});
// const audioBufferSource = flow.createNode("audio/buffer-source", Vector.create(100, 200), {});
// const convolver = flow.createNode("audio/convolver", Vector.create(100, 200), {});
// const tremoloEffect = flow.createNode("audio/tremolo", Vector.create(100, 200), {});
// const pingPongDelay = flow.createNode("audio/pingpong", Vector.create(100, 200), {});
// const stereoPanner = flow.createNode("audio/stereo-panner", Vector.create(100, 200), {});
// const spatialPanner = flow.createNode("audio/spatial-panner", Vector.create(100, 200), {});
// const noise = flow.createNode("audio/noise", Vector.create(100, 200), {});
// const oscillator = flow.createNode("audio/oscillator", Vector.create(100, 200), {});
// const oscillator1 = flow.createNode("audio/oscillator", Vector.create(100, 200), {});
// const microphone = flow.createNode("audio/microphone", Vector.create(100, 200), {});
// const distorter = flow.createNode("audio/distorter", Vector.create(100, 200), {});
// const equalizer = flow.createNode("audio/equalizer", Vector.create(100, 200), {});
// const frequencyAnalyser = flow.createNode("audio/frequency", Vector.create(100, 200), {});
// const waveformAnalyser = flow.createNode("audio/waveform", Vector.create(100, 200), {});
// const spectrogramAnalyser = flow.createNode("audio/spectrogram", Vector.create(100, 200), {});

const dial = flow.createNode("ui/dial", Vector.create(50, 50), {});
// let detune = new StandardNodes.UI.Dial(flow, { state: { min: -2400, max: 2400, value: 0 } });
// let playRate = new StandardNodes.UI.Dial(flow, { state: { min: 0.25, max: 3, value: 1 } });
// let threshold = new StandardNodes.UI.Dial(flow, { state: { min: -100, max: 0, value: -20 } });
// let ratio = new StandardNodes.UI.Dial(flow, { state: { min: 1, max: 20, value: 4 } });
// let knee = new StandardNodes.UI.Dial(flow, { state: { min: 0, max: 40, value: 5 } });
// let attack = new StandardNodes.UI.Dial(flow, { state: { min: 0, max: 1, value: 0.01 } });
// let release = new StandardNodes.UI.Dial(flow, { state: { min: 0, max: 1, value: 0.12 } });

// audioSource.outputs[0].connect(splitter.inputs[0]);
// splitter.outputs[0].connect(destination.inputs[0]);
// gain.outputsUI[0].connect(audioSource.inputs[1]);
// detune.outputsUI[0].connect(audioSource.inputs[2]);
// playRate.outputsUI[0].connect(audioSource.inputs[3]);
// metronome.outputs[0].connect(destination.inputs[0]);
// audioSource.outputs[0].connect(biquadFilter.inputs[0]);
// moogFilter.outputs[0].connect(destination.inputs[0]);
// biquadFilter.outputs[0].connect(destination.inputs[0]);
// audioSource.outputs[0].connect(spectrogramAnalyser.inputs[0]);
// spectrogramAnalyser.outputs[0].connect(destination.inputs[0]);
