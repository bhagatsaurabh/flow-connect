const FC = __FC__;

let flow = flowConnect.createFlow({
  name: "Audio Test",
  rules: {},
});

const log = flow.createNode("common/log", FC.Vector.create(50, 50), { width: 180 });
const timer = flow.createNode("common/timer", FC.Vector.create(100, 100), {});
const arrayIndex = flow.createNode("common/array-index", FC.Vector.create(50, 50), {});
const arraySource = flow.createNode("common/array-source", FC.Vector.create(100, 100), {});
const numberSource1 = flow.createNode("common/number-source", FC.Vector.create(150, 150), {});
const numberSource2 = flow.createNode("common/number-source", FC.Vector.create(150, 150), {});
const boolSource = flow.createNode("common/boolean-source", FC.Vector.create(50, 50), {});
const buffer = flow.createNode("common/buffer", FC.Vector.create(100, 100), {});
const compare = flow.createNode("common/compare", FC.Vector.create(150, 150), {});
const random = flow.createNode("common/random", FC.Vector.create(150, 150), {});
const delay = flow.createNode("common/delay", FC.Vector.create(150, 150), {});
const fileSource = flow.createNode("common/file-source", FC.Vector.create(150, 150), {});

const audioSource = flow.createNode("audio/source", FC.Vector.create(50, 50), { width: 200 });
const destination = flow.createNode("audio/destination", FC.Vector.create(200, 50), { width: 150 });

audioSource.outputs[0].connect(destination.inputs[0]);

const automate = flow.createNode("audio/automate", FC.Vector.create(100, 200), {
  state: { min: 20, max: 800, value: 20 },
});
const splitter = flow.createNode("audio/channel-splitter", FC.Vector.create(100, 200), {});
const merger = flow.createNode("audio/channel-merger", FC.Vector.create(100, 200), {});
let debug = new FC.StandardNodes.Audio.Debug(flow);
const adsr = flow.createNode("audio/adsr", FC.Vector.create(100, 200), {});
const gainNode = flow.createNode("audio/gain", FC.Vector.create(100, 200), {});
const metronome = flow.createNode("audio/metronome", FC.Vector.create(100, 200), {});
const moogEffect = flow.createNode("audio/moog", FC.Vector.create(100, 200), {});
const bitcrusherEffect = flow.createNode("audio/bitcrusher", FC.Vector.create(100, 200), {});
const biquadFilter = flow.createNode("audio/biquad", FC.Vector.create(100, 200), {});
const delayEffect = flow.createNode("audio/delay", FC.Vector.create(100, 200), {});
const dynamicsCompressor = flow.createNode("audio/dynamics-compressor", FC.Vector.create(100, 200), {});
const chorusEffect = flow.createNode("audio/chorus", FC.Vector.create(100, 200), {});
const overdriveEffect = flow.createNode("audio/overdrive", FC.Vector.create(100, 200), {});
const audioBufferSource = flow.createNode("audio/buffer-source", FC.Vector.create(100, 200), {});
const convolver = flow.createNode("audio/convolver", FC.Vector.create(100, 200), {});
const tremoloEffect = flow.createNode("audio/tremolo", FC.Vector.create(100, 200), {});
const pingPongDelay = flow.createNode("audio/pingpong", FC.Vector.create(100, 200), {});
const stereoPanner = flow.createNode("audio/stereo-panner", FC.Vector.create(100, 200), {});
const spatialPanner = flow.createNode("audio/spatial-panner", FC.Vector.create(100, 200), {});
const noise = flow.createNode("audio/noise", FC.Vector.create(100, 200), {});
const oscillator = flow.createNode("audio/oscillator", FC.Vector.create(100, 200), {});
const oscillator1 = flow.createNode("audio/oscillator", FC.Vector.create(100, 200), {});
const microphone = flow.createNode("audio/microphone", FC.Vector.create(100, 200), {});
const distorter = flow.createNode("audio/distorter", FC.Vector.create(100, 200), {});
const equalizer = flow.createNode("audio/equalizer", FC.Vector.create(100, 200), {});
const frequencyAnalyser = flow.createNode("audio/frequency", FC.Vector.create(100, 200), {});
const waveformAnalyser = flow.createNode("audio/waveform", FC.Vector.create(100, 200), {});
const spectrogramAnalyser = flow.createNode("audio/spectrogram", FC.Vector.create(100, 200), {});

const dial = flow.createNode("ui/dial", FC.Vector.create(50, 50), {});
let detune = new FC.StandardNodes.UI.Dial(flow, { state: { min: -2400, max: 2400, value: 0 } });
let playRate = new FC.StandardNodes.UI.Dial(flow, { state: { min: 0.25, max: 3, value: 1 } });
let threshold = new FC.StandardNodes.UI.Dial(flow, { state: { min: -100, max: 0, value: -20 } });
let ratio = new FC.StandardNodes.UI.Dial(flow, { state: { min: 1, max: 20, value: 4 } });
let knee = new FC.StandardNodes.UI.Dial(flow, { state: { min: 0, max: 40, value: 5 } });
let attack = new FC.StandardNodes.UI.Dial(flow, { state: { min: 0, max: 1, value: 0.01 } });
let release = new FC.StandardNodes.UI.Dial(flow, { state: { min: 0, max: 1, value: 0.12 } });

audioSource.outputs[0].connect(splitter.inputs[0]);
splitter.outputs[0].connect(destination.inputs[0]);
// gain.outputsUI[0].connect(audioSource.inputs[1]);
// detune.outputsUI[0].connect(audioSource.inputs[2]);
// playRate.outputsUI[0].connect(audioSource.inputs[3]);
metronome.outputs[0].connect(destination.inputs[0]);
audioSource.outputs[0].connect(biquadFilter.inputs[0]);
moogEffect.outputs[0].connect(destination.inputs[0]);
biquadFilter.outputs[0].connect(destination.inputs[0]);
audioSource.outputs[0].connect(spectrogramAnalyser.inputs[0]);
spectrogramAnalyser.outputs[0].connect(destination.inputs[0]);
