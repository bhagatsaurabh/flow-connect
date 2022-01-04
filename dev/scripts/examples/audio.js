let flow = flowConnect.createFlow({ name: 'Audio Test', rules: {}, terminalTypeColors: {} });

// let log = new StandardNodes.Common.Log(flow);
// let timer = new StandardNodes.Common.Timer(flow);

let audioSource = new StandardNodes.Audio.Source(flow);
let destination = new StandardNodes.Audio.Destination(flow);
// let automate = new StandardNodes.Audio.Automate(flow, { props: { min: 20, max: 800, value: 20 } });
// let splitter = new StandardNodes.Audio.ChannelSplitter(flow);
// let merger = new StandardNodes.Audio.ChannelMerger(flow);
// let debug = new StandardNodes.Audio.Debug(flow);
// let adsr = new StandardNodes.Audio.ADSR(flow);
// let gainNode = new StandardNodes.Audio.Gain(flow);
// let metronome = new StandardNodes.Audio.Metronome(flow);
// let moogEffect = new StandardNodes.Audio.MoogEffect(flow);
// let bitcrusherEffect = new StandardNodes.Audio.BitcrusherEffect(flow);
// let biquadFilter = new StandardNodes.Audio.BiquadFilter(flow);
// let delayEffect = new StandardNodes.Audio.DelayEffect(flow);
// let dynamicsCompressor = new StandardNodes.Audio.DynamicsCompressor(flow);
// let chorusEffect = new StandardNodes.Audio.ChorusEffect(flow);
// let overdriveEffect = new StandardNodes.Audio.OverdriveEffect(flow);
// let audioBufferSource = new StandardNodes.Audio.AudioBufferSource(flow);
// let convolver = new StandardNodes.Audio.Convolver(flow);
// let tremoloEffect = new StandardNodes.Audio.TremoloEffect(flow);
// let pingPongDelay = new StandardNodes.Audio.PingPongDelay(flow);
// let stereoPanner = new StandardNodes.Audio.StereoPanner(flow);
// let spatialPanner = new StandardNodes.Audio.SpatialPanner(flow);
// let noise = new StandardNodes.Audio.Noise(flow);
// let oscillator = new StandardNodes.Audio.Oscillator(flow);
// let oscillator1 = new StandardNodes.Audio.Oscillator(flow);
// let microphone = new StandardNodes.Audio.Microphone(flow);
// let distorter = new StandardNodes.Audio.Distorter(flow);
// let equalizer = new StandardNodes.Audio.Equalizer(flow);
// let frequencyAnalyser = new StandardNodes.Audio.FrequencyAnalyser(flow);
// let waveformAnalyser = new StandardNodes.Audio.WaveformAnalyser(flow);
// let spectrogramAnalyser = new StandardNodes.Audio.SpectrogramAnalyser(flow);

// let gain = new StandardNodes.UI.Dial(flow, { props: { min: 0, max: 2, value: 0.5 } });
// let detune = new StandardNodes.UI.Dial(flow, { props: { min: -2400, max: 2400, value: 0 } });
// let playRate = new StandardNodes.UI.Dial(flow, { props: { min: 0.25, max: 3, value: 1 } });
// let threshold = new StandardNodes.UI.Dial(flow, { props: { min: -100, max: 0, value: -20 } });
// let ratio = new StandardNodes.UI.Dial(flow, { props: { min: 1, max: 20, value: 4 } });
// let knee = new StandardNodes.UI.Dial(flow, { props: { min: 0, max: 40, value: 5 } });
// let attack = new StandardNodes.UI.Dial(flow, { props: { min: 0, max: 1, value: 0.01 } });
// let release = new StandardNodes.UI.Dial(flow, { props: { min: 0, max: 1, value: 0.12 } });

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
